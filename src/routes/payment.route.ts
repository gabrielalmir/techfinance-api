import { Elysia } from 'elysia';
import { paymentService } from '../config/deps';

export const paymentRoutes = (app: Elysia) => {
    app.get('/contas_receber/resumo', async () => {
        try {
            return await paymentService.summary();
        } catch (error) {
            return { status: 500, message: 'Erro ao obter resumo de contas a receber' };
        }
    });

    app.get('/contas_receber/ai', async ({ query }) => {
        try {
            return await paymentService.summaryAI(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter resumo AI de contas a receber' };
        }
    });
};
