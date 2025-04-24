import { logger } from '../config/deps';
import { CustomerRepository } from '../repositories/customer.repository';
import { cacheService } from './cache.service';

interface GetCustomersParams {
    name?: string;
    group?: string;
    limit?: number;
    page?: number;
    offset?: number;
}

export class CustomerService {
    constructor(private readonly repository: CustomerRepository) { }

    async getCustomers(params: GetCustomersParams) {
        const cacheKey = `customers:${JSON.stringify(params)}`;

        // Tentar obter do cache
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            logger.info({ params }, 'Retornando clientes do cache');
            return cached;
        }

        // Se não estiver em cache, buscar do banco
        logger.info({ params }, 'Buscando clientes do banco de dados');

        const customers = await this.repository.getCustomers({
            name: params.name ?? '',
            group: params.group ?? '',
            limit: params.limit ?? 10,
            page: params.page ?? 1,
            offset: params.offset ?? 0
        });

        // Salvar no cache
        await cacheService.set(cacheKey, customers);

        return customers;
    }
}
