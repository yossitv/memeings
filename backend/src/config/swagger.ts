import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ririsa API',
      version: '1.0.0',
      description: '画像生成サービスのREST API',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '開発用サーバー',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase Authentication IDトークンをヘッダーに指定してください'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // APIルートファイルのパス
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
