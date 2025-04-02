import { Elysia } from 'elysia';
import { customerService } from '../config/deps';

export const customerRoutes = (app: Elysia) => {
    app.get('/clientes', async ({ query }) => {
        try {
            return await customerService.getCustomers(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter clientes' };
        }
    });
};
