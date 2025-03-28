import { ApiResponse } from '../types';

export interface ImageGenerationOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  [key: string]: any;
}

export interface ImageGenerationProvider {
  generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ApiResponse>;
  mergeImages(prompt: string, images: string[], options?: ImageGenerationOptions): Promise<ApiResponse>;
  editImage(prompt: string, image: string, referenceImage?: string, options?: ImageGenerationOptions): Promise<ApiResponse>;
}
