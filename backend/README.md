# Ririsa バックエンドAPI

画像生成サービスのバックエンドAPIサーバー。Express + TypeScriptで実装しています。

## 技術スタック

- Node.js
- TypeScript
- Express
- Swagger UI & JSDoc

## インストール

```bash
# 依存関係のインストール
npm install
```

## 環境変数

`.env`ファイルを作成して以下の変数を設定します：

```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 開発

```bash
# 開発サーバーの起動（ホットリロード有効）
npm run dev
```

```
npx ts-node src/server.ts

```

## ビルドと実行

```bash
# TypeScriptのコンパイル
npm run build

# コンパイルされたアプリケーションの実行
npm start
```

## API仕様

Swagger UIを使用してAPIドキュメントを提供しています。
サーバー起動後、以下のURLでアクセスできます：

```
http://localhost:5000/api-docs
```

## APIエンドポイント

### 1. 画像生成エンドポイント

- **エンドポイント**: `/api/generate-image`
- **メソッド**: POST
- **説明**: テキストプロンプトから画像を生成します

### 2. 画像合成エンドポイント

- **エンドポイント**: `/api/merge-images`
- **メソッド**: POST
- **説明**: 複数の画像とテキストプロンプトを組み合わせて新しい画像を生成します

### 3. 画像編集エンドポイント

- **エンドポイント**: `/api/edit-image`
- **メソッド**: POST
- **説明**: 既存の画像をテキストプロンプトに基づいて編集します
