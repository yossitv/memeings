import express from 'express';
import { generateImage, mergeImages, editImage } from '../controllers/imageController';

const router = express.Router();

/**
 * @swagger
 * /api/generate-image:
 *   post:
 *     summary: テキストプロンプトから画像を生成する
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 画像生成のためのテキストプロンプト
 *     responses:
 *       200:
 *         description: 正常に画像が生成された
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: 生成に関する説明テキスト
 *                 image:
 *                   type: string
 *                   description: Base64エンコードされた画像データ
 *       400:
 *         description: 不正なリクエスト
 *       500:
 *         description: サーバーエラー
 */
router.post('/generate-image', generateImage);

/**
 * @swagger
 * /api/merge-images:
 *   post:
 *     summary: 複数の画像をプロンプトに基づいて合成する
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - images
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 画像合成のためのテキストプロンプト
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Base64エンコードされた画像データの配列（最大2枚）
 *               model_name:
 *                 type: string
 *                 description: 使用するモデル名（オプション）
 *     responses:
 *       200:
 *         description: 正常に画像が合成された
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: 合成に関する説明テキスト
 *                 image:
 *                   type: string
 *                   description: Base64エンコードされた合成画像データ
 *       400:
 *         description: 不正なリクエスト
 *       500:
 *         description: サーバーエラー
 */
router.post('/merge-images', mergeImages);

/**
 * @swagger
 * /api/edit-image:
 *   post:
 *     summary: 既存の画像をプロンプトに基づいて編集する
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - image
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 画像編集のためのテキストプロンプト
 *               image:
 *                 type: string
 *                 description: Base64エンコードされた編集対象の画像データ
 *               reference_image:
 *                 type: string
 *                 description: Base64エンコードされた参照用画像データ（オプション）
 *     responses:
 *       200:
 *         description: 正常に画像が編集された
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: 編集に関する説明テキスト
 *                 image:
 *                   type: string
 *                   description: Base64エンコードされた編集済み画像データ
 *       400:
 *         description: 不正なリクエスト
 *       500:
 *         description: サーバーエラー
 */
router.post('/edit-image', editImage);

export default router;
