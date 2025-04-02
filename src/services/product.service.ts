import { and, ilike } from "drizzle-orm";
import { db } from "../db";
import { produtos } from "../db/schema";

interface GetProductQuery {
    name?: string;
    group?: string;
    limit?: number;
    offset?: number;
}

export class ProductService {
    async getProducts({ name = '', group = '', limit = 10, offset = 0 }: GetProductQuery) {
        const products = await db.select()
            .from(produtos)
            .where(and(ilike(produtos.descricao_produto, `%${name}%`), ilike(produtos.descricao_grupo, `%${group}%`)))
            .limit(limit)
            .offset(offset)
            .execute();

        return products;
    }
}

