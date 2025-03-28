import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

import fs from 'fs';
import path from 'path';

// Firebase Admin SDK の初期化
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// 認証ミドルウェアをエクスポート
export const firebaseAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '認証情報がありません' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as Request & { user: DecodedIdToken }).user = decodedToken;
    next();
  } catch (error) {
    console.error('トークン検証エラー:', error);
    res.status(401).json({ error: 'トークンの検証に失敗しました' });
    return;
  }
};