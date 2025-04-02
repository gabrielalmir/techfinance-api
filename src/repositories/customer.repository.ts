import { and, ilike } from "drizzle-orm";
import { db } from "../db";
import { clientes } from "../db/schema";

export interface GetCustomersQuery {
    name: string;
    group: string;
    limit: number;
    offset: number;
    page: number;
}

export class CustomerRepository {
    async getCustomers(query: GetCustomersQuery) {
        const customers = await db.select()
            .from(clientes)
            .where(and(ilike(clientes.razao_cliente, `%${query.name}%`), ilike(clientes.descricao_grupo, `%${query.group}%`)))
            .limit(query.limit)
            .offset(query.offset)
            .execute();

        return customers;
    }
}
