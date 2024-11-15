import { z } from "zod";
import { db } from "../db";
import { vendas } from "../db/schema";

export const saleQuerySchema = z.object({ 
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class SaleService {
    async getSales(query: Record<string, string | undefined>) {
        const { limite = 10, pagina = 1 } = saleQuerySchema.parse(query);
        const offset = (pagina - 1) * limite;

        const sales = await db.select()
            .from(vendas)
            .limit(limite)
            .offset(offset)
            .execute();

        return sales;
    }
}