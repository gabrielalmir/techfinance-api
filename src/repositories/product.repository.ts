import { db } from "../db";
import type { Produto } from "../db/schema";

export interface GetProductQuery {
    name?: string;
    group?: string;
    limit?: number;
    offset?: number;
}

export class ProductRepository {
    async getProducts({ name = '', group = '', limit = 10, offset = 0 }: GetProductQuery): Promise<Produto[]> {
        const products = await db`
            SELECT * FROM fatec_produtos
            WHERE descricao_produto ILIKE ${`%${name}%`}
            AND descricao_grupo ILIKE ${`%${group}%`}
            LIMIT ${limit}
            OFFSET ${offset}
        `;
        return products as Produto[];
    }
}
