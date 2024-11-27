import { and, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { produtos } from "../db/schema";

const productQuerySchema = z.object({
    nome: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class ProductService {
    async getProducts(query: Record<string, string | undefined>) {
        const { nome = '', grupo = '', limite = 10, pagina = 1 } = productQuerySchema.parse(query);
        const offset = (pagina - 1) * limite;

        const products = await db.select()
            .from(produtos)
            .where(and(ilike(produtos.descricao_produto, `%${nome}%`), ilike(produtos.descricao_grupo, `%${grupo}%`)))
            .limit(limite)
            .offset(offset)
            .execute();

        return products;
    }
}

