import { Elysia } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { logger, salesService } from '../config/deps';

export const salesRoutes = (app: Elysia) => {
    app.get('/vendas', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de vendas');
        const result = await tryCatchAsync(() => salesService.getSales(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao obter vendas');
            return { status: 500, message: 'Erro ao obter vendas' };
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de vendas concluída com sucesso');

        return result.value;
    });

    app.get('/empresas/participacao', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de participação de empresas');
        const result = await tryCatchAsync(() => salesService.getCompanySalesParticipation(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao obter participação de empresas');
            return { status: 500, message: 'Erro ao obter participação de empresas' };
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de participação de empresas concluída com sucesso');

        return result.value;
    });

    app.get('/empresas/participacao-por-valor', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de participação de empresas por valor');
        const result = await tryCatchAsync(() => salesService.getCompanySalesParticipationByValue(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao obter participação de empresas por valor');
            return { status: 500, message: 'Erro ao obter participação de empresas por valor' };
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de participação de empresas por valor concluída com sucesso');

        return result.value;
    });
};
