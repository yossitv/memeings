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
  },
  apis: ['./src/routes/*.ts'], // APIルートファイルのパス
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
