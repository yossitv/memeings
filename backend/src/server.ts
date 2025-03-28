import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import config from './config';
import { errorHandler } from './middleware/errorHandler';
import imageRoutes from './routes/imageRoutes';

// Expressアプリケーションの初期化
const app: Express = express();

// ミドルウェアの設定
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' })); // 画像データを扱うため上限を増やす
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Swaggerドキュメントの設定
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ルートの設定
app.use('/api', imageRoutes);

// ルートエンドポイント
app.get('/', (req: Request, res: Response) => {
  res.send('Ririsa API サーバーが稼働中です。 /api-docs でAPI仕様を確認できます。');
});

// 404エラーハンドリング
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404);
  next(new Error(`リクエストされたURL ${req.originalUrl} が見つかりません`));
});

// グローバルエラーハンドリング
app.use(errorHandler);

// サーバーの起動
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`環境: ${config.nodeEnv}`);
});

export default app;
