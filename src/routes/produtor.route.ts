import express, { Request, Response, NextFunction } from 'express';
import ProdutorController from '../controllers/produtor.controller';
import { Produtor } from '@prisma/client';
import { asyncHandler } from '../utils/errors';
import { Pagination } from '../utils/types';
import { HttpException } from '../utils/errors';
import Joi from 'joi';

const router = express.Router();
const produtorController = new ProdutorController();

/**
 * @swagger
 * tags:
 *   name: Produtor
 *   description: API para gerenciar produtores
 */

const produtorCreateSchema = Joi.object({
  nome: Joi.string().required(),
  cpfCnpj: Joi.string().required(),
  fazenda: Joi.string().required(),
  cidade: Joi.string().required(),
  estado: Joi.string().required(),
  areaTotal: Joi.number().required(),
  areaAgricola: Joi.number().required(),
  areaVegetacao: Joi.number().required(),
  culturas: Joi.array().items(Joi.string()).required(),
});

const produtorUpdateSchema = Joi.object({
  nome: Joi.string(),
  cpfCnpj: Joi.string(),
  fazenda: Joi.string(),
  cidade: Joi.string(),
  estado: Joi.string(),
  areaTotal: Joi.number(),
  areaAgricola: Joi.number(),
  areaVegetacao: Joi.number(),
  culturas: Joi.array().items(Joi.string()),
});

/**
 * @swagger
 * /produtor/dashboards:
 *   get:
 *     summary: Retorna estatísticas do dashboard
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get(
  '/dashboards',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const dashboard = await produtorController.getDashboards();
    res.json(dashboard);
  }),
);

/**
 * @swagger
 * /produtor:
 *   get:
 *     summary: Retorna lista paginada de produtores
 *     tags: [Produtor]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de produtores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produtor'
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const pagination: Pagination = {
      page: parseInt((req.query.page as string) || '1'),
      limit: parseInt((req.query.limit as string) || '10'),
    };

    const produtores = await produtorController.getProdutores(pagination);
    res.json(produtores);
  }),
);

/**
 * @swagger
 * /produtor:
 *   post:
 *     summary: Cria um novo produtor
 *     tags: [Produtor]
 *     requestBody:
 *       required: true
 *       content:
 *
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const produtorObject: Produtor = req.body;
    const { error } = produtorCreateSchema.validate(produtorObject);
    if (error) {
      throw new HttpException(400, error.message);
    }
    const produtor = await produtorController.createProdutor(produtorObject);
    res.status(201).json(produtor);
  }),
);

/**
 * @swagger
 * /produtor/{id}:
 *   get:
 *     summary: Retorna um produtor específico por ID
 *     tags: [Produtor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const produtor = await produtorController.getProdutor(req.params.id);
    res.json(produtor);
  }),
);

/**
 * @swagger
 * /produtor/{id}:
 *   put:
 *     summary: Atualiza um produtor específico por ID
 *     tags: [Produtor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const produtorObject: Partial<Produtor> = req.body;
    const { error } = produtorUpdateSchema.validate(produtorObject);
    if (error) {
      throw new HttpException(400, error.message);
    }
    const produtor = await produtorController.updateProdutor(
      req.params.id,
      produtorObject,
    );
    res.status(200).json(produtor);
  }),
);

/**
 * @swagger
 * /produtor/{id}:
 *   delete:
 *     summary: Deleta um produtor específico por ID
 *     tags: [Produtor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const produtor = await produtorController.deleteProdutor(req.params.id);
    res.status(200).json(produtor);
  }),
);

export default router;
