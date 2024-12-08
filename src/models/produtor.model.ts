import { PrismaClient, Produtor } from '@prisma/client';
import { Pagination } from '../utils/types';

/**
 * Model class for handling Produtor (Producer/Farmer) database operations
 * @class ProdutorModel
 */
class ProdutorModel {
  /** Prisma client instance for database operations */
  private prisma = new PrismaClient();

  /**
   * Retrieves a single produtor by ID
   * @param {string} id - The unique identifier of the produtor
   * @returns {Promise<Produtor | null>} The produtor data or null if not found
   */
  getProdutor(id: string) {
    return this.prisma.produtor.findUnique({ where: { id } });
  }

  /**
   * Retrieves a paginated list of produtores
   * @param {Pagination} pagination - The pagination parameters
   * @returns {Promise<Produtor[]>} Array of produtor records
   */
  getProdutores(pagination: Pagination) {
    return this.prisma.produtor.findMany({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
  }

  /**
   * Creates a new produtor record
   * @param {Produtor} produtor - The produtor data to create
   * @returns {Promise<Produtor>} The created produtor record
   */
  createProdutor(produtor: Produtor) {
    return this.prisma.produtor.create({ data: produtor });
  }

  /**
   * Updates an existing produtor record
   * @param {string} id - The unique identifier of the produtor
   * @param {Partial<Produtor>} produtor - The partial produtor data to update
   * @returns {Promise<Produtor>} The updated produtor record
   */
  updateProdutor(id: string, produtor: Partial<Produtor>) {
    return this.prisma.produtor.update({
      where: { id },
      data: produtor,
    });
  }

  /**
   * Deletes a produtor record
   * @param {string} id - The unique identifier of the produtor to delete
   * @returns {Promise<Produtor>} The deleted produtor record
   */
  deleteProdutor(id: string) {
    return this.prisma.produtor.delete({ where: { id } });
  }

  /**
   * Retrieves the total count of farms
   * @returns {Promise<{ totalFazendas: number }>} Object containing the total count of farms
   */
  async getDashboardByQuantity() {
    const count = await this.prisma.produtor.count();
    return { totalFazendas: count };
  }

  /**
   * Calculates the total area of all farms
   * @returns {Promise<{ totalArea: number | null }>} Object containing the sum of all farm areas
   */
  async getDashboardByArea() {
    const totalArea = await this.prisma.produtor.aggregate({
      _sum: { areaTotal: true },
    });

    return { totalArea: totalArea._sum.areaTotal };
  }

  /**
   * Retrieves statistics about cultures (crops) across all farms
   * @returns {Promise<{ totalPorCultura: Array<{ cultura: string, total: number }> }>}
   * Object containing count of farms per culture
   */
  async getDashboardByCulture() {
    const culturas = await this.prisma.produtor.findMany({
      select: {
        culturas: true,
      },
    });
    const totalCulturas = new Set(
      culturas.map(cultura => cultura.culturas).flat(),
    );

    const totalPorCultura = Array.from(totalCulturas).map(cultura => ({
      cultura,
      total: culturas.filter(c => c.culturas.includes(cultura)).length,
    }));

    return { totalPorCultura };
  }

  /**
   * Calculates the percentage distribution of soil usage (agricultural vs vegetation)
   * @returns {Promise<{ totalPorSolo: { areaAgricola: string, areaVegetacao: string } }>}
   * Object containing percentages of agricultural and vegetation areas
   */
  async getDashboardBySoil() {
    const totalArea = await this.prisma.produtor.aggregate({
      _sum: { areaAgricola: true, areaVegetacao: true, areaTotal: true },
    });

    return {
      totalPorSolo: {
        areaAgricola: Math.round(
          (Number(totalArea._sum.areaAgricola) /
            Number(totalArea._sum.areaTotal ?? 0)) *
            100,
        ).toFixed(2),
        areaVegetacao: Math.round(
          (Number(totalArea._sum.areaVegetacao) /
            Number(totalArea._sum.areaTotal ?? 0)) *
            100,
        ).toFixed(2),
      },
    };
  }

  /**
   * Retrieves statistics about farm distribution across states
   * @returns {Promise<{ totalPorEstado: Array<{ estado: string, _count: { _all: number } }> }>}
   * Object containing count of farms per state
   */
  async getDashboardByState() {
    const totalPorEstado = await this.prisma.produtor.groupBy({
      by: ['estado'],
      _count: { _all: true },
    });

    return { totalPorEstado };
  }
}

export default ProdutorModel;
