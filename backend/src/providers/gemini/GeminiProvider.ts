import { GoogleGenAI } from '@google/genai';
import { ApiResponse } from '../../types';
import { ImageGenerationOptions, ImageGenerationProvider } from '../ImageGenerationProvider';

export class GeminiProvider implements ImageGenerationProvider {
  private ai: any;
  private defaultModel: string = 'gemini-2.0-flash-exp-image-generation';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API キーが設定されていません');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ApiResponse> {
    try {
      const modelName = options?.model || this.defaultModel;
      
      console.log(`Generating image with Gemini model: ${modelName}`);
      console.log(`Prompt: ${prompt}`);

      // モデルにコンテンツを生成させる
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseModalities: ['Text', 'Image'],
          temperature: options?.temperature || 1,
          topP: options?.topP || 0.95,
          topK: options?.topK || 64,
          maxOutputTokens: options?.maxOutputTokens || 65536,
        },
      });

      console.log('Gemini response received');
      let imageBase64 = '';
      let responseText = '';

      // レスポンスからテキストと画像を抽出
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          responseText = part.text;
          console.log('Text response:', responseText);
        } else if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          console.log('Image data received, length:', imageBase64.length);
        }
      }

      if (!imageBase64) {
        console.warn('画像が生成されませんでした。テキスト応答のみを返します。');
        return {
          text: responseText || `プロンプト "${prompt}" に基づいた応答です`,
          image: undefined
        };
      }

      return {
        text: responseText || '画像が生成されました',
        image: imageBase64
      };
    } catch (error) {
      console.error('Gemini 画像生成エラー:', error);
      throw new Error(`画像生成に失敗しました: ${(error as Error).message}`);
    }
  }

  async mergeImages(prompt: string, images: string[], options?: ImageGenerationOptions): Promise<ApiResponse> {
    try {
      const modelName = options?.model || this.defaultModel;
      
      console.log(`Merging images with Gemini model: ${modelName}`);
      console.log(`Prompt: ${prompt}`);
      console.log(`Number of images: ${images.length}`);

      // リクエストのコンテンツを構築
      const contents: any[] = [
        { text: `以下の画像（${images.length}枚）を見て、次のプロンプトに基づいて新しい画像を生成してください: ${prompt}` }
      ];

      // 画像をコンテンツに追加
      for (const imageBase64 of images) {
        contents.push({
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        });
      }

      // モデルにコンテンツを生成させる
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          responseModalities: ['Text', 'Image'],
          temperature: options?.temperature || 1,
          topP: options?.topP || 0.95,
          topK: options?.topK || 64,
          maxOutputTokens: options?.maxOutputTokens || 65536,
        },
      });

      console.log('Gemini response received');
      let imageBase64 = '';
      let responseText = '';

      // レスポンスからテキストと画像を抽出
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          responseText = part.text;
          console.log('Text response:', responseText);
        } else if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          console.log('Image data received, length:', imageBase64.length);
        }
      }

      if (!imageBase64) {
        console.warn('画像が生成されませんでした。テキスト応答のみを返します。');
        return {
          text: responseText || `${images.length}枚の画像から新しい画像を生成できませんでした`,
          image: undefined
        };
      }

      return {
        text: responseText || `${images.length}枚の画像から新しい画像が生成されました`,
        image: imageBase64
      };
    } catch (error) {
      console.error('Gemini 画像合成エラー:', error);
      throw new Error(`画像合成に失敗しました: ${(error as Error).message}`);
    }
  }

  async editImage(prompt: string, image: string, referenceImage?: string, options?: ImageGenerationOptions): Promise<ApiResponse> {
    try {
      const modelName = options?.model || this.defaultModel;
      
      console.log(`Editing image with Gemini model: ${modelName}`);
      console.log(`Prompt: ${prompt}`);
      console.log(`Reference image provided: ${!!referenceImage}`);

      // リクエストのコンテンツを構築
      const contents: any[] = [
        { text: `次の画像を次のプロンプトに基づいて編集してください: ${prompt}` },
        {
          inlineData: {
            data: image,
            mimeType: 'image/jpeg'
          }
        }
      ];

      // 参照画像がある場合は追加
      if (referenceImage) {
        contents.push({ text: "これは参照画像です。スタイルやコンセプトの参考にしてください。" });
        contents.push({
          inlineData: {
            data: referenceImage,
            mimeType: 'image/jpeg'
          }
        });
      }

      // モデルにコンテンツを生成させる
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          responseModalities: ['Text', 'Image'],
          temperature: options?.temperature || 1,
          topP: options?.topP || 0.95,
          topK: options?.topK || 64,
          maxOutputTokens: options?.maxOutputTokens || 65536,
        },
      });

      console.log('Gemini response received');
      let imageBase64 = '';
      let responseText = '';

      // レスポンスからテキストと画像を抽出
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          responseText = part.text;
          console.log('Text response:', responseText);
        } else if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          console.log('Image data received, length:', imageBase64.length);
        }
      }

      if (!imageBase64) {
        console.warn('画像が生成されませんでした。テキスト応答のみを返します。');
        return {
          text: responseText || '画像を編集できませんでした',
          image: undefined
        };
      }

      return {
        text: responseText || '画像が編集されました',
        image: imageBase64
      };
    } catch (error) {
      console.error('Gemini 画像編集エラー:', error);
      throw new Error(`画像編集に失敗しました: ${(error as Error).message}`);
    }
  }
}
