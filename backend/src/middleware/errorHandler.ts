import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

// エラーハンドリングミドルウェア
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('エラー:', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  const errorResponse: ErrorResponse = {
    error: err.name,
    statusCode,
    message: err.message || 'サーバーエラーが発生しました',
  };

  res.status(statusCode).json(errorResponse);
};
