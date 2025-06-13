import { Elysia } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { logger, salesService } from '../config/deps';

export const salesRoutes = (app: Elysia) => {
    app.get('/vendas', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de vendas');
        const result = await tryCatchAsync(() => salesService.getSales(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao obter vendas');
            return new Response(JSON.stringify({ status: 500, message: 'Erro ao obter vendas' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de vendas concluída com sucesso');

        return new Response(JSON.stringify(result.value), {
            headers: { 'Content-Type': 'application/json' }
        });
    });

    app.get('/empresas/participacao', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de participação de empresas');
        const result = await tryCatchAsync(async () => await salesService.getCompanySalesParticipation(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao obter participação de empresas');
            return new Response(JSON.stringify({ status: 500, message: 'Erro ao obter participação de empresas' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de participação de empresas concluída com sucesso');

        return new Response(JSON.stringify(result.value), {
            headers: { 'Content-Type': 'application/json' }
        });
    });

    app.get('/empresas/participacao-por-valor', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de participação de empresas por valor');
        const result = await tryCatchAsync(() => salesService.getCompanySalesParticipationByValue(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao obter participação de empresas por valor');
            return new Response(JSON.stringify({ status: 500, message: 'Erro ao obter participação de empresas por valor' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de participação de empresas por valor concluída com sucesso');

        return new Response(JSON.stringify(result.value), {
            headers: { 'Content-Type': 'application/json' }
        });
    });
};
