import ProdutorModel from '../models/produtor.model';
import { Produtor } from '@prisma/client';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { HttpException } from '../utils/errors';
import { Pagination, DashboardType } from '../utils/types';

/**
 * Classe controladora para manipulação da lógica de negócios do Produtor
 * @class ProdutorController
 */
class ProdutorController {
  /** Instância do ProdutorModel para operações no banco de dados */
  private produtorModel = new ProdutorModel();

  /**
   * Cria uma instância do ProdutorController
   * @constructor
   */
  constructor() {
    this.produtorModel = new ProdutorModel();
  }

  /**
   * Recupera um único produtor pelo ID
   * @param {string} id - O identificador único do produtor
   * @throws {HttpException} Quando o produtor não é encontrado
   * @returns {Promise<Produtor>} Os dados do produtor
   */
  async getProdutor(id: string) {
    const produtor = await this.produtorModel.getProdutor(id);

    if (!produtor) {
      throw new HttpException(404, 'Produtor não encontrado');
    }

    return produtor;
  }

  /**
   * Recupera uma lista paginada de produtores
   * @param {Pagination} pagination - Os parâmetros de paginação
   * @returns {Promise<Produtor[]>} Array de registros de produtores
   */
  getProdutores(pagination: Pagination) {
    return this.produtorModel.getProdutores(pagination);
  }

  /**
   * Cria um novo registro de produtor após validação
   * @param {Produtor} produtor - Os dados do produtor a serem criados
   * @throws {HttpException} Quando CPF/CNPJ é inválido ou a validação de área falha
   * @returns {Promise<Produtor>} O registro do produtor criado
   */
  createProdutor(produtor: Produtor) {
    if (!this.validateCpfCnpj(produtor.cpfCnpj)) {
      throw new HttpException(400, 'CPF ou CNPJ inválido');
    }

    this.validateArea(produtor);

    return this.produtorModel.createProdutor(produtor);
  }

  /**
   * Atualiza um registro existente de produtor
   * @param {string} id - O identificador único do produtor
   * @param {Partial<Produtor>} produtor - Os dados parciais do produtor a serem atualizados
   * @returns {Promise<Produtor>} O registro do produtor atualizado
   */
  updateProdutor(id: string, produtor: Partial<Produtor>) {
    return this.produtorModel.updateProdutor(id, produtor);
  }

  /**
   * Exclui um registro de produtor
   * @param {string} id - O identificador único do produtor a ser excluído
   * @returns {Promise<Produtor>} O registro do produtor excluído
   */
  deleteProdutor(id: string) {
    return this.produtorModel.deleteProdutor(id);
  }

  /**
   * Recupera todos os dados do dashboard
   * @returns {Promise<Array<any>>} Array contendo todas as estatísticas do dashboard
   */
  async getDashboards() {
    const dashboardHandler = {
      getByQuantity: () => this.produtorModel.getDashboardByQuantity(),
      getByArea: () => this.produtorModel.getDashboardByArea(),
      getByState: () => this.produtorModel.getDashboardByState(),
      getByCulture: () => this.produtorModel.getDashboardByCulture(),
      getBySoil: () => this.produtorModel.getDashboardBySoil(),
    };

    const dashboards = await Promise.all(
      Object.keys(dashboardHandler).map(async key => {
        return dashboardHandler[key as DashboardType]();
      }),
    );

    return dashboards;
  }

  /**
   * Valida número de CPF ou CNPJ
   * @param {string} cpfCnpj - O número de CPF ou CNPJ a ser validado
   * @returns {boolean} Verdadeiro se válido, falso caso contrário
   * @private
   */
  private validateCpfCnpj(cpfCnpj: string) {
    return cpf.isValid(cpfCnpj) || cnpj.isValid(cpfCnpj);
  }

  /**
   * Valida os cálculos de área da fazenda
   * @param {Produtor} produtor - Os dados do produtor a serem validados
   * @private
   */
  private validateArea(produtor: Produtor) {
    // A soma de área agrícultável e vegetação, não deverá ser maior que a área total da fazenda
    if (produtor.areaAgricola + produtor.areaVegetacao > produtor.areaTotal) {
      throw new HttpException(400, 'Área total inválida');
    }
  }
}

export default ProdutorController;
