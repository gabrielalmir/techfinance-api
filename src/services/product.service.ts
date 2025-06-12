import { logger } from '../config/deps';
import type { Produto } from '../db/schema';
import { ProductRepository } from '../repositories/product.repository';
import { cacheService } from './cache.service';

interface GetProductsParams {
    name?: string;
    group?: string;
    limit?: number;
    offset?: number;
}

export class ProductService {
    constructor(private readonly repository: ProductRepository) { }

    async getProducts(params: GetProductsParams): Promise<Produto[]> {
        const cacheKey = `products:${JSON.stringify(params)}`;

        // Tentar obter do cache
        const cached = await cacheService.get<Produto[]>(cacheKey);
        if (cached) {
            logger.info({ params }, 'Retornando produtos do cache');
            return cached;
        }

        // Se não estiver em cache, buscar do banco
        logger.info({ params }, 'Buscando produtos do banco de dados');
        const products = await this.repository.getProducts(params);

        // Salvar no cache
        await cacheService.set(cacheKey, products);

        return products;
    }
}

