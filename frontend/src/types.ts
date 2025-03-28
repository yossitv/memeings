// モードプリセットの型定義
export interface ModePreset {
  prompt: string;
  description: string;
  inputDisabled: boolean;
  inputPlaceholder?: string;  // 入力ボックスの説明文
  icon?: string;
  order?: number;
  isCustom?: boolean;
}

// モードデータベースの型定義
export interface ModesDatabase {
  modes: Record<string, ModePreset>;
  lastUpdated: number;
}

// デフォルトのモードプリセット
export const DEFAULT_MODE_PRESETS: Record<string, ModePreset> = {
  clothing: {
    prompt: "次の画像の人物に、2枚目の服を着せてください。元の人物の顔や特徴はそのまま保持してください。自然な合成を心がけてください。",
    description: "1枚目: あなたの画像、2枚目: 着せたい服の画像",
    inputDisabled: true,
    icon: "👕",
    order: 1
  },
  hairstyle: {
    prompt: "次の画像の人物の髪型を、2枚目の髪型に変更してください。元の人物の顔の特徴や服装などはそのまま保持してください。自然な仕上がりにしてください。",
    description: "1枚目: あなたの画像、2枚目: なりたい髪型の画像",
    inputDisabled: true,
    icon: "💇",
    order: 2
  },
  freestyle: {
    prompt: "",
    description: "自由に画像とプロンプトを組み合わせられます",
    inputDisabled: false,
    inputPlaceholder: "画像に対して行いたい編集や生成の指示を入力してください...",
    icon: "🎨",
    order: 3
  }
};

export type AppMode = keyof typeof DEFAULT_MODE_PRESETS | string;

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  images?: string[];
  timestamp: number;
}

export interface ChatMessage {
  prompt: string;
}

export interface EditImageRequest extends ChatMessage {
  image: string;
  reference_image?: string;  // 追加の参考画像（オプション）
}

export interface MergeImagesRequest extends ChatMessage {
  images: string[];  // 複数の画像（Base64エンコード）を格納する配列
  model_name?: string;  // オプションのモデル名
}

export interface ApiResponse {
  text?: string;
  image?: string;
}

export interface AppState {
  messages: Message[];
  currentImage: string | null;
  isFirstMessage: boolean;
}
