import { z } from "zod";
import { logger } from '../config/deps';
import { SalesRepository } from "../repositories/sales.repository";
import { cacheService } from './cache.service';

export const saleQuerySchema = z.object({
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class SaleService {
    constructor(private readonly salesRepository: SalesRepository) { }

    async getSales(query: Record<string, any>) {
        try {
            // Validar e definir valores padrão seguros - múltiplos nomes de parâmetros
            const limite = Number(query.limit || query.limite || 100);
            const pagina = Number(query.page || query.pagina || 0);

            // Validar se são números válidos
            const limiteSafe = isNaN(limite) ? 100 : Math.min(Math.max(1, limite), 1000);
            const paginaSafe = isNaN(pagina) ? 0 : Math.max(0, pagina);
            const offset = paginaSafe * limiteSafe;

            logger.warn(`getSales service called with query:`, query, `-> processed: limite=${limiteSafe}, pagina=${paginaSafe}, offset=${offset}`);

            return await this.salesRepository.getSales(limiteSafe, offset);
        } catch (error: any) {
            logger.error('Error in getSales service:', error.message);
            return [];
        }
    }

    async getTopProductsByQuantity(query: Record<string, string | undefined>) {
        const cacheKey = `top_products_quantity:${JSON.stringify(query)}`;

        const cached = await cacheService.get(cacheKey);
        if (cached) {
            logger.info({ query }, 'Retornando produtos mais vendidos do cache');
            return cached;
        }

        logger.info({ query }, 'Buscando produtos mais vendidos do banco de dados');
        const { limite = 10 } = saleQuerySchema.parse(query);
        const products = await this.salesRepository.getTopProductsByQuantity(limite);

        await cacheService.set(cacheKey, products);

        return products;
    }

    async getTopProductsByValue(query: Record<string, string | undefined>) {
        const cacheKey = `top_products_value:${JSON.stringify(query)}`;

        const cached = await cacheService.get(cacheKey);
        if (cached) {
            logger.info({ query }, 'Retornando produtos de maior valor do cache');
            return cached;
        }

        logger.info({ query }, 'Buscando produtos de maior valor do banco de dados');
        const { limite = 10 } = saleQuerySchema.parse(query);
        const products = await this.salesRepository.getTopProductsByValue(limite);

        await cacheService.set(cacheKey, products);

        return products;
    }

    async getCompanySalesParticipation(query: Record<string, string | undefined>) {
        try {
            const { limite = 10 } = saleQuerySchema.parse(query);
            logger.info({ query, limite }, 'Buscando participação de empresas');
            return await this.salesRepository.getCompanySalesParticipation(limite);
        } catch (error) {
            logger.error({ error, query }, 'Erro ao buscar participação de empresas');
            throw error;
        }
    }

    async getCompanySalesParticipationByValue(query: Record<string, string | undefined>) {
        try {
            const { limite = 10 } = saleQuerySchema.parse(query);
            logger.info({ query, limite }, 'Buscando participação de empresas por valor');
            return await this.salesRepository.getCompanySalesParticipationByValue(limite);
        } catch (error) {
            logger.error({ error, query }, 'Erro ao buscar participação de empresas por valor');
            throw error;
        }
    }

    async getPriceVariationByProduct(query: Record<string, string | undefined>) {
        const cacheKey = `price_variation:${JSON.stringify(query)}`;

        const cached = await cacheService.get(cacheKey);
        if (cached) {
            logger.info({ query }, 'Retornando variação de preço do cache');
            return cached;
        }

        logger.info({ query }, 'Buscando variação de preço do banco de dados');
        const { limite = 10 } = saleQuerySchema.parse(query);
        const variations = await this.salesRepository.getPriceVariationByProduct(limite);

        await cacheService.set(cacheKey, variations);

        return variations;
    }
}
