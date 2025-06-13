import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { logger, paymentService } from '../config/deps';

export const paymentRoutes = (app: Elysia) => {
    app.get('/contas_receber/resumo', async () => {
        logger.info('Iniciando busca de resumo de contas a receber');
        const result = await tryCatchAsync(() => paymentService.summary());

        if (!result.ok) {
            logger.error({ error: result.error }, 'Erro ao obter resumo de contas a receber');
            return new Response(JSON.stringify({ status: 500, message: 'Erro ao obter resumo de contas a receber' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        return new Response(JSON.stringify(result.value), {
            headers: { 'Content-Type': 'application/json' }
        });
    });

    app.get('/contas_receber/ai', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de resumo AI de contas a receber');
        const result = await tryCatchAsync(() => paymentService.summaryAI(query));

        if (!result.ok) {
            logger.error({ error: result.error }, 'Erro ao obter resumo AI de contas a receber');
            return new Response(JSON.stringify({ status: 500, message: 'Erro ao obter resumo AI de contas a receber' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        return new Response(JSON.stringify(result.value), {
            headers: { 'Content-Type': 'application/json' }
        });
    }, {
        query: t.Object({
            prompt: t.String()
        })
    });
};
