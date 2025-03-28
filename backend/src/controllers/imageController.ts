import { Request, Response, NextFunction } from 'express';
import { 
  GenerateImageRequest, 
  MergeImagesRequest, 
  EditImageRequest
} from '../types';
import { setupImageService } from '../services/setupServices';

// 画像生成サービスの初期化
const imageService = setupImageService();

// 画像生成コントローラー
export const generateImage = async (
  req: Request<{}, {}, GenerateImageRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt, provider, options } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'プロンプトが指定されていません' });
      return;
    }

    // 画像生成サービスを利用
    const response = await imageService.generateImage(prompt, provider, options);
    
    res.status(200).json(response);
  } catch (error) {
    console.error('画像生成エラー:', error);
    next(error); // Expressの標準的なエラーハンドリングに従う
  }
};

// 画像合成コントローラー
export const mergeImages = async (
  req: Request<{}, {}, MergeImagesRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt, images, model_name, options } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'プロンプトが指定されていません' });
      return;
    }

    // 画像合成サービスを利用
    const mergeOptions = {
      ...options,
      model: model_name || options?.model
    };
    
    const response = await imageService.mergeImages(
      prompt, 
      images || [], 
      undefined, // 明示的なプロバイダー指定がない場合はデフォルト
      mergeOptions
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('画像合成エラー:', error);
    next(error); // Expressの標準的なエラーハンドリングに従う
  }
};

// 画像編集コントローラー
export const editImage = async (
  req: Request<{}, {}, EditImageRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt, image, reference_image, provider, options } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'プロンプトが指定されていません' });
      return;
    }

    if (!image) {
      res.status(400).json({ error: '編集する画像が指定されていません' });
      return;
    }

    // 画像編集サービスを利用
    const response = await imageService.editImage(
      prompt,
      image,
      reference_image,
      provider,
      options
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('画像編集エラー:', error);
    next(error); // Expressの標準的なエラーハンドリングに従う
  }
};
