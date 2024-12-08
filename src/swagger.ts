import swaggerJSDOC from 'swagger-jsdoc';

const swaggerDefinition = {
  info: {
    title: 'Brain Swagger',
    version: '1.0.0',
    description: 'Brain Swagger para rotas de produtor',
  },
  host: 'localhost:3001',
  basePath: '/',
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/produtor.route.ts'],
};

export default swaggerJSDOC(options);
