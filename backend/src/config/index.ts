import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // APIキー
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

export default config;
