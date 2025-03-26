import axios from 'axios';
import { DEFAULT_MODE_PRESETS } from '../types';
import type { 
  ChatMessage, 
  EditImageRequest, 
  MergeImagesRequest, 
  ApiResponse,
  ModesDatabase,
  ModePreset
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// レスポンスインターセプターを追加
axiosInstance.interceptors.response.use(
  (response) => {
    const responseData = {
      status: response.status,
      headers: Object.fromEntries(Object.entries(response.headers)),
      data: response.data
    };
    console.log('Raw API Response:', JSON.stringify(responseData, null, 2));
    return response;
  },
  (error) => {
    const errorData = {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    };
    console.error('API Error Response:', JSON.stringify(errorData, null, 2));
    return Promise.reject(error);
  }
);

// ローカルストレージのキー
const MODES_STORAGE_KEY = 'ririsa_modes';

// モードデータの初期化
const initializeModesIfNeeded = (): ModesDatabase => {
  const storedModes = localStorage.getItem(MODES_STORAGE_KEY);
  if (!storedModes) {
    const initialModes: ModesDatabase = {
      modes: DEFAULT_MODE_PRESETS,
      lastUpdated: Date.now()
    };
    localStorage.setItem(MODES_STORAGE_KEY, JSON.stringify(initialModes));
    return initialModes;
  }
  return JSON.parse(storedModes);
};

export const api = {
  // モード管理関連のAPI
  async getModes(): Promise<ModesDatabase> {
    return initializeModesIfNeeded();
  },

  async addMode(id: string, preset: ModePreset): Promise<ModesDatabase> {
    const modesDb = initializeModesIfNeeded();
    if (modesDb.modes[id]) {
      throw new Error(`モード "${id}" は既に存在します`);
    }
    
    modesDb.modes[id] = {
      ...preset,
      isCustom: true,
      order: Object.keys(modesDb.modes).length + 1
    };
    modesDb.lastUpdated = Date.now();
    
    localStorage.setItem(MODES_STORAGE_KEY, JSON.stringify(modesDb));
    return modesDb;
  },

  async updateMode(id: string, preset: ModePreset): Promise<ModesDatabase> {
    const modesDb = initializeModesIfNeeded();
    if (!modesDb.modes[id]) {
      throw new Error(`モード "${id}" が見つかりません`);
    }
    
    // デフォルトモードの場合は更新を制限
    if (!modesDb.modes[id].isCustom && id in DEFAULT_MODE_PRESETS) {
      throw new Error(`デフォルトモード "${id}" は編集できません`);
    }
    
    modesDb.modes[id] = {
      ...preset,
      isCustom: true,
      order: modesDb.modes[id].order
    };
    modesDb.lastUpdated = Date.now();
    
    localStorage.setItem(MODES_STORAGE_KEY, JSON.stringify(modesDb));
    return modesDb;
  },

  async deleteMode(id: string): Promise<ModesDatabase> {
    const modesDb = initializeModesIfNeeded();
    if (!modesDb.modes[id]) {
      throw new Error(`モード "${id}" が見つかりません`);
    }
    
    // デフォルトモードの削除を防止
    if (!modesDb.modes[id].isCustom && id in DEFAULT_MODE_PRESETS) {
      throw new Error(`デフォルトモード "${id}" は削除できません`);
    }
    
    delete modesDb.modes[id];
    modesDb.lastUpdated = Date.now();
    
    localStorage.setItem(MODES_STORAGE_KEY, JSON.stringify(modesDb));
    return modesDb;
  },

  async generateImage(message: ChatMessage): Promise<ApiResponse> {
    try {
      console.log('Sending generate image request:', message);
      
      const response = await axiosInstance.post('/generate-image', message);
      const responseData = {
        status: response.status,
        headers: Object.fromEntries(Object.entries(response.headers)),
        data: response.data
      };
      console.log('Raw generate image response:', JSON.stringify(responseData, null, 2));

      const data = response.data;
      if (!data) {
        throw new Error('APIレスポンスが空です');
      }

      if (!data.text && !data.image) {
        throw new Error('APIレスポンスにテキストも画像も含まれていません');
      }

      console.log('Processing generate image response:', {
        text: data.text || '',
        imageType: typeof data.image,
        imageLength: data.image ? data.image.length : 0,
        imagePreview: data.image ? data.image.substring(0, 50) + '...' : 'null'
      });

      const processedImage = data.image ? this.processImageData(data.image) : null;
      const result: ApiResponse = {
        text: data.text || '画像が生成されました',
        image: processedImage || undefined
      };

      console.log('Final processed result:', {
        text: result.text || '',
        imageLength: result.image?.length || 0,
        imagePreview: result.image ? result.image.substring(0, 50) + '...' : 'null'
      });

      return result;
    } catch (error) {
      console.error('画像生成エラー:', error);
      throw error;
    }
  },

  async mergeImages(request: MergeImagesRequest): Promise<ApiResponse> {
    try {
      // 最大2枚の画像に制限
      if (request.images.length > 2) {
        request.images = request.images.slice(0, 2);
      }

      // 画像処理（データURIプレフィックスの処理など）
      const processedImages = request.images.map(img => {
        if (img.startsWith('data:')) {
          const parts = img.split(',');
          if (parts.length === 2) {
            return parts[1];
          }
        }
        return img;
      });

      console.log('Sending merge images request:', {
        prompt: request.prompt,
        imagesCount: processedImages.length,
        model_name: request.model_name
      });

      const response = await axiosInstance.post('/merge-images', {
        ...request,
        images: processedImages
      });

      const data = response.data;
      if (!data) {
        throw new Error('APIレスポンスが空です');
      }

      if (!data.text && !data.image) {
        throw new Error('APIレスポンスにテキストも画像も含まれていません');
      }

      console.log('Processing merge images response:', {
        text: data.text || '',
        imageType: typeof data.image,
        imageLength: data.image ? data.image.length : 0,
        imagePreview: data.image ? data.image.substring(0, 50) + '...' : 'null'
      });

      const processedImage = data.image ? this.processImageData(data.image) : null;
      const result: ApiResponse = {
        text: data.text || '画像がマージされました',
        image: processedImage || undefined
      };

      return result;
    } catch (error) {
      console.error('画像マージエラー:', error);
      throw error;
    }
  },

  async editImage(request: EditImageRequest): Promise<ApiResponse> {
    try {
      // data:image/jpeg;base64, の部分を取り除く
      let imageToSend = request.image;
      let referenceImageToSend = request.reference_image;

      if (imageToSend.startsWith('data:')) {
        const parts = imageToSend.split(',');
        if (parts.length === 2) {
          imageToSend = parts[1];
        }
      }

      if (referenceImageToSend && referenceImageToSend.startsWith('data:')) {
        const parts = referenceImageToSend.split(',');
        if (parts.length === 2) {
          referenceImageToSend = parts[1];
        }
      }

      console.log('Sending edit image request:', {
        prompt: request.prompt,
        originalImageLength: request.image.length,
        processedImageLength: imageToSend.length,
        hasReferenceImage: !!referenceImageToSend,
        referenceImageLength: referenceImageToSend?.length,
        originalImagePreview: request.image.substring(0, 50) + '...',
        processedImagePreview: imageToSend.substring(0, 50) + '...',
        hasDataPrefix: request.image.startsWith('data:'),
        isBase64: this.isBase64(imageToSend)
      });

      const response = await axiosInstance.post('/edit-image', {
        ...request,
        image: imageToSend,
        reference_image: referenceImageToSend
      });
      const responseData = {
        status: response.status,
        headers: Object.fromEntries(Object.entries(response.headers)),
        data: response.data
      };
      console.log('Raw edit image response:', JSON.stringify(responseData, null, 2));

      const data = response.data;
      if (!data) {
        throw new Error('APIレスポンスが空です');
      }

      if (!data.text && !data.image) {
        throw new Error('APIレスポンスにテキストも画像も含まれていません');
      }

      console.log('Processing edit image response:', {
        text: data.text || '',
        imageType: typeof data.image,
        imageLength: data.image ? data.image.length : 0,
        imagePreview: data.image ? data.image.substring(0, 50) + '...' : 'null'
      });

      const processedImage = data.image ? this.processImageData(data.image) : null;
      const result: ApiResponse = {
        text: data.text || '画像が編集されました',
        image: processedImage || undefined
      };

      console.log('Final processed result:', {
        text: result.text || '',
        imageLength: result.image?.length || 0,
        imagePreview: result.image ? result.image.substring(0, 50) + '...' : 'null'
      });

      return result;
    } catch (error) {
      console.error('画像編集エラー:', error);
      throw error;
    }
  },

  processImageData(image: string): string | null {
    if (!image || typeof image !== 'string') {
      console.error('無効な画像データです:', image);
      return null;
    }

    try {
      console.log('Processing image data:', {
        original: image.substring(0, 100) + '...',
        length: image.length,
        isBase64: this.isBase64(image),
        startsWithData: image.startsWith('data:'),
        startsWithSlash: image.startsWith('/')
      });

      if (image.startsWith('data:')) {
        console.log('Image is already a data URI');
        return image;
      }

      if (this.isBase64(image)) {
        const result = `data:image/jpeg;base64,${image}`;
        console.log('Added Base64 prefix, final length:', result.length);
        return result;
      }

      if (image.startsWith('/')) {
        const result = `${API_BASE_URL}${image}`;
        console.log('Combined with base URL:', result);
        return result;
      }

      console.log('Using as complete URL:', image);
      return image;
    } catch (error) {
      console.error('画像データの処理中にエラーが発生しました:', error);
      return '';
    }
  },

  isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }
};
