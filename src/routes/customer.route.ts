import { Elysia } from 'elysia';
import { z } from 'zod';
import { customerService } from '../config/deps';

const customerQuerySchema = z.object({
    nome: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export const customerRoutes = (app: Elysia) => {
    app.get('/clientes', async ({ query }) => {
        try {
            const parsedQuery = customerQuerySchema.parse(query);

            const { nome = '', grupo = '', limite = 10, pagina = 1 } = parsedQuery;
            const offset = (pagina - 1) * limite;

            return await customerService.getCustomers({ name: nome, group: grupo, limit: limite, page: pagina, offset });
        } catch (error) {
            return { status: 500, message: 'Erro ao obter clientes' };
        }
    });
};
