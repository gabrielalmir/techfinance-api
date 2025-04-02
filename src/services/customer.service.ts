import { z } from "zod";
import type { CustomerRepository } from "../repositories/customer.repository";

const customerQuerySchema = z.object({
    nome: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export class CustomerService {
    constructor(
        private readonly customerRepository: CustomerRepository,
    ) { }

    async getCustomers(query: Record<string, string | undefined>) {
        const { nome = '', grupo = '', limite = 10, pagina = 1 } = customerQuerySchema.parse(query);
        const offset = (pagina - 1) * limite;
        const customers = await this.customerRepository.getCustomers({ name: nome, group: grupo, limit: limite, page: pagina, offset });

        return customers;
    }
}
