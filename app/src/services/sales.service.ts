import { z } from "zod";
import { SalesRepository } from "../repositories/sales.repository";

export const saleQuerySchema = z.object({
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class SaleService {
    constructor(private readonly salesRepository: SalesRepository) { }

    async getSales(query: Record<string, any>) {
        const { limit, pagina = 0 } = query;
        const offset = pagina * limit;
        return this.salesRepository.getSales(limit, offset);
    }

    async getTopProductsByQuantity(query: Record<string, string | undefined>) {
        const { limite = 10 } = saleQuerySchema.parse(query);
        return this.salesRepository.getTopProductsByQuantity(limite);
    }

    async getTopProductsByValue(query: Record<string, string | undefined>) {
        const { limite = 10 } = saleQuerySchema.parse(query);
        return this.salesRepository.getTopProductsByValue(limite);
    }

    async getCompanySalesParticipation(query: Record<string, string | undefined>) {
        const { limite = 10 } = saleQuerySchema.parse(query);
        return this.salesRepository.getCompanySalesParticipation(limite);
    }

    async getPriceVariationByProduct(query: Record<string, string | undefined>) {
        const { limite = 10 } = saleQuerySchema.parse(query);
        return this.salesRepository.getPriceVariationByProduct(limite);
    }
}
