import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { customerService } from '../config/deps';

export const customerRoutes = (app: Elysia) => {
    app.get('/clientes', async ({ query }) => {
        const { nome = '', grupo = '', limite = 10, pagina = 1 } = query;
        const offset = (pagina - 1) * limite;

        const result = await tryCatchAsync(() =>
            customerService.getCustomers({ name: nome, group: grupo, limit: limite, page: pagina, offset })
        );

        if (!result.ok) {
            return { status: 500, message: 'Erro ao obter clientes' };
        }

        return result.value;
    }, {
        query: t.Object({
            nome: t.Optional(t.String()),
            grupo: t.Optional(t.String()),
            limite: t.Optional(t.Number()),
            pagina: t.Optional(t.Number())
        })
    });
};
