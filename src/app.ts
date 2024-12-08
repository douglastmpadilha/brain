import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import produtorRoute from './routes/produtor.route';
import handleErrors from './utils/errors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

dotenv.config();

export default async () => {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.use('/produtor', produtorRoute);
  app.use('/docs', express.static('docs'));
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/health', (req, res) => {
    res.send({ status: 'ok' });
  });

  app.get('/', (req, res) => {
    res.send({ message: 'Hello, World!' });
  });

  app.use(handleErrors());

  return app;
};
