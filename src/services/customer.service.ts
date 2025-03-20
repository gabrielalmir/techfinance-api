import { and, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { clientes } from "../db/schema";

const customerQuerySchema = z.object({
    nome: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class CustomerService {
    async getCustomers(query: Record<string, string | undefined>) {
        const { nome = '', grupo = '', limite = 10, pagina = 1 } = customerQuerySchema.parse(query);
        const offset = (pagina - 1) * limite;

        const customers = await db.select()
            .from(clientes)
            .where(and(ilike(clientes.razao_cliente, `%${nome}%`), ilike(clientes.descricao_grupo, `%${grupo}%`)))
            .limit(limite)
            .offset(offset)
            .execute();

        return customers;
    }
}
