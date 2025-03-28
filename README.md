# Ririsa - 画像生成サービス

このプロジェクトは画像生成AIを活用したWebアプリケーションです。

## プロジェクト構成

- `frontend/` - Reactベースのフロントエンドアプリケーション
- `backend/` - バックエンドAPI（実装予定）

## フロントエンド

フロントエンドは以下の技術を使用して実装されています：
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.1.4
- Tailwind CSS 3.4.1

詳細は[frontend/README.md](./frontend/README.md)を参照してください。

## バックエンドAPI仕様

バックエンドAPIは以下のエンドポイントを提供します：

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
