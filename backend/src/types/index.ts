// API リクエストとレスポンスの型定義

import { ImageGenerationOptions } from '../providers/ImageGenerationProvider';

// 画像生成リクエスト
export interface GenerateImageRequest {
  prompt: string;
  provider?: string;
  options?: ImageGenerationOptions;
}

// 画像合成リクエスト
export interface MergeImagesRequest {
  prompt: string;
  images: string[];  // Base64エンコードされた画像データの配列
  model_name?: string;
  provider?: string;
  options?: ImageGenerationOptions;
}

// 画像編集リクエスト
export interface EditImageRequest {
  prompt: string;
  image: string;  // Base64エンコードされた画像データ
  reference_image?: string;  // Base64エンコードされた参照画像データ（オプション）
  provider?: string;
  options?: ImageGenerationOptions;
}

// APIレスポンス
export interface ApiResponse {
  text?: string;  // 生成されたテキストまたは説明
  image?: string;  // Base64エンコードされた画像データ
}

// エラーレスポンス
export interface ErrorResponse {
  error: string;
  statusCode: number;
  message: string;
}
