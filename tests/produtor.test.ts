import request from 'supertest';
import { Express } from 'express';
import app from '../src/app';
import { cpf } from 'cpf-cnpj-validator';
import { Produtor, PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

describe('Basic Route Test', () => {
  let expressApp: Express;
  let server: http.Server;
  let produtorObject: Omit<Produtor, 'id' | 'createdAt' | 'updatedAt'>;

  beforeAll(async () => {
    expressApp = await app();
    server = http.createServer(expressApp);

    produtorObject = {
      nome: 'Teste',
      cidade: 'Teste',
      estado: 'Teste',
      fazenda: 'Teste',
      cpfCnpj: cpf.generate(),
      areaTotal: 100,
      areaAgricola: 40,
      areaVegetacao: 10,
      culturas: ['Teste'],
    };
  });

  afterEach(async () => {
    await prisma.produtor.deleteMany();
  });

  it('should create a produtor', async () => {
    const response = await request(server)
      .post('/produtor')
      .send(produtorObject);

    expect(response.status).toBe(201);
  });

  it('should get a produtor', async () => {
    const produtor = await request(server)
      .post('/produtor')
      .send(produtorObject);

    const response = await request(server).get(`/produtor/${produtor.body.id}`);

    expect(response.status).toBe(200);
  });

  it('should get all produtores', async () => {
    const produtor1 = await request(server)
      .post('/produtor')
      .send(produtorObject);

    const produtor2 = await request(server)
      .post('/produtor')
      .send({
        nome: 'Teste2',
        cidade: 'Teste2',
        estado: 'Teste2',
        fazenda: 'Teste2',
        cpfCnpj: cpf.generate(),
        areaTotal: 100,
        areaAgricola: 40,
        areaVegetacao: 10,
        culturas: ['Teste2'],
      });

    const response = await request(server).get('/produtor');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].id).toBe(produtor1.body.id);
    expect(response.body[1].id).toBe(produtor2.body.id);
  });

  it('should update a produtor', async () => {
    const produtor = await request(server)
      .post('/produtor')
      .send(produtorObject);

    const response = await request(server)
      .put(`/produtor/${produtor.body.id}`)
      .send({
        nome: 'Teste2',
      });

    const produtorUpdated = await request(server).get(
      `/produtor/${produtor.body.id}`,
    );

    expect(response.status).toBe(200);
    expect(produtorUpdated.body.nome).toBe('Teste2');
  });

  it('should not update a produtor with no valid property', async () => {
    const produtor = await request(server)
      .post('/produtor')
      .send(produtorObject);

    const response = await request(server)
      .put(`/produtor/${produtor.body.id}`)
      .send({
        invalidProperty: 'invalidProperty',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('\"invalidProperty\" is not allowed');
  });

  it('should delete a produtor', async () => {
    const produtor = await request(server)
      .post('/produtor')
      .send(produtorObject);

    const response = await request(server).delete(
      `/produtor/${produtor.body.id}`,
    );

    expect(response.status).toBe(200);

    const produtorDeleted = await request(server).get(
      `/produtor/${produtor.body.id}`,
    );

    expect(produtorDeleted.status).toBe(404);
  });

  it('should return 400 for invalid area total', async () => {
    const response = await request(server)
      .post('/produtor')
      .send({
        ...produtorObject,
        areaAgricola: 40,
        areaVegetacao: 100,
        areaTotal: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Área total inválida');
  });

  it('should return 400 for invalid cpf or cnpj', async () => {
    const response = await request(server)
      .post('/produtor')
      .send({
        ...produtorObject,
        cpfCnpj: '1234567890',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('CPF ou CNPJ inválido');
  });

  it('should return 200 for valid pagination', async () => {
    const produtor1 = await request(server)
      .post('/produtor')
      .send(produtorObject);

    const produtor2 = await request(server)
      .post('/produtor')
      .send({
        nome: 'Teste2',
        cidade: 'Teste2',
        estado: 'Teste2',
        fazenda: 'Teste2',
        cpfCnpj: cpf.generate(),
        areaTotal: 100,
        areaAgricola: 40,
        areaVegetacao: 10,
        culturas: ['Teste2'],
      });

    const response = await request(server).get('/produtor?page=1&limit=1');

    expect(response.status).toBe(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toBe(produtor1.body.id);

    const response2 = await request(server).get('/produtor?page=2&limit=1');

    expect(response2.status).toBe(200);
    expect(response2.body.length).toBe(1);
    expect(response2.body[0].id).toBe(produtor2.body.id);
  });

  it('should return 200 for dashboard', async () => {
    await request(server).post('/produtor').send(produtorObject);

    await request(server)
      .post('/produtor')
      .send({
        nome: 'Teste2',
        cidade: 'Teste2',
        estado: 'Teste2',
        fazenda: 'Teste2',
        cpfCnpj: cpf.generate(),
        areaTotal: 100,
        areaAgricola: 40,
        areaVegetacao: 10,
        culturas: ['Teste', 'Teste2'],
      });

    const response = await request(server).get('/produtor/dashboards');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
    expect(response.body[0].totalFazendas).toBe(2);
    expect(response.body[1].totalArea).toBe(200);
    expect(response.body[2].totalPorEstado).toHaveLength(2);
    expect(response.body[3].totalPorCultura).toHaveLength(2);
    expect(response.body[3].totalPorCultura[0]).toHaveProperty('cultura');
    expect(response.body[3].totalPorCultura[0]).toHaveProperty('total');
    expect(response.body[4].totalPorSolo).toHaveProperty('areaAgricola');
    expect(response.body[4].totalPorSolo).toHaveProperty('areaVegetacao');
  });
});
