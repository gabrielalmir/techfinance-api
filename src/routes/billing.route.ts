import { Elysia } from 'elysia';
import { salesService } from '../config/deps';

export const salesRoutes = (app: Elysia) => {
    app.get('/vendas', async ({ query }) => {
        try {
            return await salesService.getSales(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter vendas' };
        }
    });

    app.get('/empresas/participacao', async ({ query }) => {
        try {
            return await salesService.getCompanySalesParticipation(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter participação de empresas' };
        }
    });

    app.get('/empresas/participacao-por-valor', async ({ query }) => {
        try {
            return await salesService.getCompanySalesParticipationByValue(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter participação de empresas por valor' };
        }
    });
};
