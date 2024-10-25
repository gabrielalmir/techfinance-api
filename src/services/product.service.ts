import { and, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { produtos } from "../db/schema";

const productQuerySchema = z.object({
    descricao: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export const productService = {
    getProducts: async (query: Record<string, string | undefined>) => {
        const { descricao = '', grupo = '', limite = 10, pagina = 1 } = productQuerySchema.parse(query);
        const offset = (pagina - 1) * limite;

        const products = await db.select()
            .from(produtos)
            .where(and(ilike(produtos.descricao_produto, `%${descricao}%`), ilike(produtos.descricao_grupo, `%${grupo}%`)))
            .limit(limite)
            .offset(offset)
            .execute();

        return products;
    },
};
