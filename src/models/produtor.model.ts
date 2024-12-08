import { PrismaClient, Produtor } from '@prisma/client';
import { Pagination } from '../utils/types';

/**
 * Classe modelo para manipulação de operações no banco de dados relacionadas ao Produtor
 * @class ProdutorModel
 */
class ProdutorModel {
  /** Instância do cliente Prisma para operações no banco de dados */
  private prisma = new PrismaClient();

  /**
   * Recupera um único produtor pelo ID
   * @param {string} id - O identificador único do produtor
   * @returns {Promise<Produtor | null>} Os dados do produtor ou null se não encontrado
   */
  getProdutor(id: string) {
    return this.prisma.produtor.findUnique({ where: { id } });
  }

  /**
   * Recupera uma lista paginada de produtores
   * @param {Pagination} pagination - Os parâmetros de paginação
   * @returns {Promise<Produtor[]>} Array de registros de produtores
   */
  getProdutores(pagination: Pagination) {
    return this.prisma.produtor.findMany({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
  }

  /**
   * Cria um novo registro de produtor
   * @param {Produtor} produtor - Os dados do produtor a serem criados
   * @returns {Promise<Produtor>} O registro do produtor criado
   */
  createProdutor(produtor: Produtor) {
    return this.prisma.produtor.create({ data: produtor });
  }

  /**
   * Atualiza um registro existente de produtor
   * @param {string} id - O identificador único do produtor
   * @param {Partial<Produtor>} produtor - Os dados parciais do produtor a serem atualizados
   * @returns {Promise<Produtor>} O registro do produtor atualizado
   */
  updateProdutor(id: string, produtor: Partial<Produtor>) {
    return this.prisma.produtor.update({
      where: { id },
      data: produtor,
    });
  }

  /**
   * Exclui um registro de produtor
   * @param {string} id - O identificador único do produtor a ser excluído
   * @returns {Promise<Produtor>} O registro do produtor excluído
   */
  deleteProdutor(id: string) {
    return this.prisma.produtor.delete({ where: { id } });
  }

  /**
   * Recupera o número total de fazendas
   * @returns {Promise<{ totalFazendas: number }>} Objeto contendo o número total de fazendas
   */
  async getDashboardByQuantity() {
    const count = await this.prisma.produtor.count();

    return { totalFazendas: count };
  }

  /**
   * Calcula a área total de todas as fazendas
   * @returns {Promise<{ totalArea: number | null }>} Objeto contendo a soma de todas as áreas das fazendas
   */
  async getDashboardByArea() {
    const totalArea = await this.prisma.produtor.aggregate({
      _sum: { areaTotal: true },
    });

    return { totalArea: totalArea._sum.areaTotal };
  }

  /**
   * Recupera estatísticas sobre culturas em todas as fazendas
   * @returns {Promise<{ totalPorCultura: Array<{ cultura: string, total: number }> }>}
   * Objeto contendo contagem de fazendas por cultura
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
   * Calcula a distribuição percentual do uso do solo (agrícola vs vegetação)
   * @returns {Promise<{ totalPorSolo: { areaAgricola: string, areaVegetacao: string } }>}
   * Objeto contendo percentuais de áreas agrícolas e de vegetação
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
   * Recupera estatísticas sobre a distribuição de fazendas por estados
   * @returns {Promise<{ totalPorEstado: Array<{ estado: string, _count: { _all: number } }> }>}
   * Objeto contendo contagem de fazendas por estado
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
