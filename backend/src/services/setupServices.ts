import { ImageGenerationService } from './image/ImageGenerationService';
import { GeminiProvider } from '../providers/gemini/GeminiProvider';
import config from '../config';

let imageService: ImageGenerationService | null = null;

export function setupImageService(): ImageGenerationService {
  if (imageService) return imageService;

  // サービスのインスタンス化
  imageService = new ImageGenerationService('gemini');

  // Geminiプロバイダー登録
  const geminiProvider = new GeminiProvider(config.geminiApiKey);
  imageService.registerProvider('gemini', geminiProvider);

  // 将来的に他のプロバイダーをここに追加

  return imageService;
}
