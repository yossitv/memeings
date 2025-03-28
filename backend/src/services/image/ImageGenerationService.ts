import { ApiResponse } from '../../types';
import { ImageGenerationOptions, ImageGenerationProvider } from '../../providers/ImageGenerationProvider';

export class ImageGenerationService {
  private providers: Map<string, ImageGenerationProvider> = new Map();
  private defaultProvider: string;

  constructor(defaultProvider: string = 'gemini') {
    this.defaultProvider = defaultProvider;
  }

  registerProvider(name: string, provider: ImageGenerationProvider): void {
    this.providers.set(name, provider);
  }

  async generateImage(prompt: string, providerName?: string, options?: ImageGenerationOptions): Promise<ApiResponse> {
    const provider = this.getProvider(providerName || this.defaultProvider);
    
    try {
      // 画像生成の実行
      const response = await provider.generateImage(prompt, options);
      return response;
    } catch (error) {
      console.error('画像生成エラー:', error);
      throw error;
    }
  }

  async mergeImages(prompt: string, images: string[], providerName?: string, options?: ImageGenerationOptions): Promise<ApiResponse> {
    const provider = this.getProvider(providerName || this.defaultProvider);
    
    try {
      // 最大2枚までの画像に制限
      const processedImages = images.slice(0, 2);
      
      // 画像がない場合はテキストのみのレスポンス
      if (processedImages.length === 0) {
        return this.generateImage(prompt, providerName, options);
      }
      
      // 画像合成の実行
      const response = await provider.mergeImages(prompt, processedImages, options);
      return response;
    } catch (error) {
      console.error('画像合成エラー:', error);
      throw error;
    }
  }

  async editImage(prompt: string, image: string, referenceImage?: string, providerName?: string, options?: ImageGenerationOptions): Promise<ApiResponse> {
    const provider = this.getProvider(providerName || this.defaultProvider);
    
    try {
      // 画像編集の実行
      const response = await provider.editImage(prompt, image, referenceImage, options);
      return response;
    } catch (error) {
      console.error('画像編集エラー:', error);
      throw error;
    }
  }

  private getProvider(name: string): ImageGenerationProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`プロバイダー "${name}" が見つかりません`);
    }
    return provider;
  }
}
