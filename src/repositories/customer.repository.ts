import { db } from "../db";
import type { Cliente } from "../db/schema";

export interface GetCustomersQuery {
    name: string;
    group: string;
    limit: number;
    offset: number;
    page: number;
}

export class CustomerRepository {
    async getCustomers(query: GetCustomersQuery): Promise<Cliente[]> {
        const customers = await db`
            SELECT * FROM fatec_clientes
            WHERE razao_cliente ILIKE ${`%${query.name}%`}
            AND descricao_grupo ILIKE ${`%${query.group}%`}
            LIMIT ${query.limit}
            OFFSET ${query.offset}
        `;
        return customers as Cliente[];
    }
}
