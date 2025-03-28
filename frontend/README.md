# ririsa-front

チャットとイメージ処理機能を備えたReactフロントエンドアプリケーション。AIを活用した画像生成・編集が可能なインタラクティブなWebアプリケーションです。

## 技術スタック

- React 18.2.0
- TypeScript 5.2.2
- Vite 5.1.4
- Tailwind CSS 3.4.1
- axios 1.6.7
- uuid 9.0.0
- Firebase Authentication 10.8.1

## インストール手順

```bash
# 依存関係のインストール
npm install
```

## Firebase設定

このアプリケーションはFirebase Authenticationを使用してユーザー認証を行います。独自のFirebaseプロジェクトを作成し、以下のような形式の設定を`src/config/firebase.ts`ファイルに記述する必要があります：

```javascript
// src/config/firebase.ts
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

これらの値はFirebaseコンソールの「プロジェクト設定」>「全般」タブ>「マイアプリ」セクションで確認できます。

**セキュリティ上の注意**：
- Firebaseのクライアント側APIキーは、ウェブアプリケーションのソースコードに含めることを前提に設計されています。
- 実際のセキュリティはFirebase認証システムとFirebaseのセキュリティルール、およびバックエンドのトークン検証によって担保されています。
- 適切な認証なしにはデータにアクセスできないよう設計されています。

## 使用方法

```bash
# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# ビルドしたアプリケーションのプレビュー
npm run preview

# リント
npm run lint
```

## 開発環境

- Node.js
- npm

## プロジェクト構成

```
src/
├── assets/        # 静的アセット（画像、アイコンなど）
├── components/    # Reactコンポーネント
├── hooks/         # カスタムフック
├── services/      # APIサービス
└── types/         # 型定義
```

## 主要コンポーネント

### ChatPanel
- チャットインターフェースを提供
- メッセージの送信・表示機能
- 画像のアップロード機能を統合
- モードに応じたプロンプトテンプレートのサポート
- レスポンシブデザイン対応

### ImagePanel
- 画像の表示・管理機能
- ドラッグ＆ドロップによる画像アップロード
- クリップボードからの画像貼り付け
- 画像のダウンロード機能
- モードに応じた画像枚数制限

### ImageUploadArea
- 複数画像のアップロードサポート
- ドラッグ＆ドロップ機能
- 画像のプレビュー表示
- 画像の並び替え機能
- モバイル対応（カメラ撮影、ギャラリー選択）

### ChatMessage
- ユーザーとAIのメッセージ表示
- 画像のサムネイル表示
- タイムスタンプ表示
- レスポンシブなレイアウト

### MobileTabNavigation
- モバイル向けのタブナビゲーション
- チャット/画像表示の切り替え
- アニメーション効果
- タッチフレンドリーなUI

### AdminPanel
- モード設定の管理機能
- カスタムモードの作成・編集・削除
- プロンプトテンプレートの設定
- ユーザー入力の有効/無効切り替え
- アイコンと説明文のカスタマイズ

## カスタムフック

### useTheme
- ダークモード/ライトモードの切り替え管理
- システムのカラーテーマ設定との連携
- ローカルストレージによる設定の永続化
- 自動的なテーマ切り替え検知

## 特徴

- レスポンシブデザイン
- ダークモードサポート
- ドラッグ＆ドロップ対応
- クリップボード統合
- カスタマイズ可能なモード設定
- 直感的なユーザーインターフェース

## ライセンス

このプロジェクトはプライベートリポジトリとして管理されています。

## バックエンドAPI仕様

フロントエンドは以下のAPIエンドポイントを使用して画像生成・編集を行います。ベースURLは `https://11b9-118-238-237-219.ngrok-free.app` です。

### 1. 画像生成エンドポイント

- **エンドポイント**: `/generate-image`
- **メソッド**: POST
- **リクエスト形式**:
  ```typescript
  {
    "prompt": string // 生成指示のプロンプトテキスト
  }
  ```
- **レスポンス形式**:
  ```typescript
  {
    "text": string,  // 生成されたテキストまたは説明（オプション）
    "image": string  // Base64エンコードされた画像データ（オプション）
  }
  ```

### 2. 画像合成エンドポイント

- **エンドポイント**: `/merge-images`
- **メソッド**: POST
- **リクエスト形式**:
  ```typescript
  {
    "prompt": string,           // 生成指示のプロンプトテキスト
    "images": string[],         // Base64エンコードされた画像データの配列（最大2枚）
    "model_name": string        // オプションのモデル名
  }
  ```
- **レスポンス形式**:
  ```typescript
  {
    "text": string,  // 生成されたテキストまたは説明（オプション）
    "image": string  // Base64エンコードされた画像データ（オプション）
  }
  ```

### 3. 画像編集エンドポイント

- **エンドポイント**: `/edit-image`
- **メソッド**: POST
- **リクエスト形式**:
  ```typescript
  {
    "prompt": string,           // 編集指示のプロンプトテキスト
    "image": string,            // Base64エンコードされた編集対象画像
    "reference_image": string   // オプションの参照画像（Base64エンコード）
  }
  ```
- **レスポンス形式**:
  ```typescript
  {
    "text": string,  // 生成されたテキストまたは説明（オプション）
    "image": string  // Base64エンコードされた編集済み画像データ（オプション）
  }
  ```

**注意事項**:
- 画像データはBase64エンコードして送信してください（Data URIプレフィックスは含めないでください）
- リクエストヘッダーには `Content-Type: application/json` と `Accept: application/json` を含めてください
- エラーが発生した場合は、適切なHTTPステータスコードとエラーメッセージを含むJSONレスポンスが返されます
