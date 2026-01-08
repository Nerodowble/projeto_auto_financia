import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinAuto Hub API',
      version: '1.0.0',
      description: 'Documentação da API para o sistema de cotação de financiamento de veículos FinAuto Hub',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },
  apis: ['./src/api/routes/*.ts'], // Caminho para os arquivos que contêm as anotações da API
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;