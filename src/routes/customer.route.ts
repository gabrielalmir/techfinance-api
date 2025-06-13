import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { customerService, logger } from '../config/deps';

export const customerRoutes = (app: Elysia) => {
    app.get('/clientes', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de clientes');

        const { nome = '', grupo = '', limite = 10, pagina = 1 } = query;
        const offset = (pagina - 1) * limite;

        const result = await tryCatchAsync(() =>
            customerService.getCustomers({ name: nome, group: grupo, limit: limite, page: pagina, offset })
        );

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao buscar clientes');
            return new Response(JSON.stringify({ status: 500, message: 'Erro ao obter clientes' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de clientes concluída com sucesso');

        return new Response(JSON.stringify(result.value), {
            headers: { 'Content-Type': 'application/json' }
        });
    }, {
        query: t.Object({
            nome: t.Optional(t.String()),
            grupo: t.Optional(t.String()),
            limite: t.Optional(t.Number()),
            pagina: t.Optional(t.Number())
        })
    });
};
