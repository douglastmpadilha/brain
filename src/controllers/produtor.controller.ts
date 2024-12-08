import ProdutorModel from '../models/produtor.model';
import { Produtor } from '@prisma/client';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { HttpException } from '../utils/errors';
import { Pagination, DashboardType } from '../utils/types';

/**
 * Controller class for handling Produtor (Producer/Farmer) business logic
 * @class ProdutorController
 */
class ProdutorController {
  /** Instance of ProdutorModel for database operations */
  private produtorModel = new ProdutorModel();

  /**
   * Creates an instance of ProdutorController
   * @constructor
   */
  constructor() {
    this.produtorModel = new ProdutorModel();
  }

  /**
   * Retrieves a single produtor by ID
   * @param {string} id - The unique identifier of the produtor
   * @throws {HttpException} When produtor is not found
   * @returns {Promise<Produtor>} The produtor data
   */
  async getProdutor(id: string) {
    const produtor = await this.produtorModel.getProdutor(id);

    if (!produtor) {
      throw new HttpException(404, 'Produtor não encontrado');
    }

    return produtor;
  }

  /**
   * Retrieves a paginated list of produtores
   * @param {Pagination} pagination - The pagination parameters
   * @returns {Promise<Produtor[]>} Array of produtor records
   */
  getProdutores(pagination: Pagination) {
    return this.produtorModel.getProdutores(pagination);
  }

  /**
   * Creates a new produtor record after validation
   * @param {Produtor} produtor - The produtor data to create
   * @throws {HttpException} When CPF/CNPJ is invalid or area validation fails
   * @returns {Promise<Produtor>} The created produtor record
   */
  createProdutor(produtor: Produtor) {
    if (!this.validateCpfCnpj(produtor.cpfCnpj)) {
      throw new HttpException(400, 'CPF ou CNPJ inválido');
    }

    this.validateArea(produtor);

    return this.produtorModel.createProdutor(produtor);
  }

  /**
   * Updates an existing produtor record
   * @param {string} id - The unique identifier of the produtor
   * @param {Partial<Produtor>} produtor - The partial produtor data to update
   * @returns {Promise<Produtor>} The updated produtor record
   */
  updateProdutor(id: string, produtor: Partial<Produtor>) {
    return this.produtorModel.updateProdutor(id, produtor);
  }

  /**
   * Deletes a produtor record
   * @param {string} id - The unique identifier of the produtor to delete
   * @returns {Promise<Produtor>} The deleted produtor record
   */
  deleteProdutor(id: string) {
    return this.produtorModel.deleteProdutor(id);
  }

  /**
   * Retrieves all dashboard data
   * @returns {Promise<Array<any>>} Array containing all dashboard statistics
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
   * Validates CPF or CNPJ number
   * @param {string} cpfCnpj - The CPF or CNPJ number to validate
   * @returns {boolean} True if valid, false otherwise
   * @private
   */
  private validateCpfCnpj(cpfCnpj: string) {
    return cpf.isValid(cpfCnpj) || cnpj.isValid(cpfCnpj);
  }

  /**
   * Validates farm area calculations
   * @param {Produtor} produtor - The produtor data to validate
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
