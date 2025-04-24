import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { logger, paymentService } from '../config/deps';

export const paymentRoutes = (app: Elysia) => {
    app.get('/contas_receber/resumo', async () => {
        logger.info('Iniciando busca de resumo de contas a receber');
        const result = await tryCatchAsync(() => paymentService.summary());

        if (!result.ok) {
            logger.error({ error: result.error }, 'Erro ao obter resumo de contas a receber');
            return { status: 500, message: 'Erro ao obter resumo de contas a receber' };
        }

        return result.value;
    }, {
        query: t.Object({
            prompt: t.Optional(t.String())
        })
    });

    app.get('/contas_receber/ai', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de resumo AI de contas a receber');
        const result = await tryCatchAsync(() => paymentService.summaryAI(query));

        if (!result.ok) {
            logger.error({ error: result.error }, 'Erro ao obter resumo AI de contas a receber');
            return { status: 500, message: 'Erro ao obter resumo AI de contas a receber' };
        }

        return result.value;
    });
};
