import { Elysia } from 'elysia';
import { z } from 'zod';
import { productService, salesService } from '../config/deps';

const productQuerySchema = z.object({
    nome: z.string().optional(),
    grupo: z.string().optional(),
    limite: z.coerce.number().optional(),
    pagina: z.coerce.number().optional(),
});

export const productsRoutes = (app: Elysia) => {
    app.get('/produtos', async ({ query }) => {
        try {
            const { nome, grupo, limite = 10, pagina = 1 } = productQuerySchema.parse(query);
            const offset = (pagina - 1) * limite;
            return await productService.getProducts({ name: nome, group: grupo, limit: limite, offset });
        } catch (error) {
            return { status: 500, message: 'Erro ao obter produtos' };
        }
    });

    app.get('/produtos/mais-vendidos', async ({ query }) => {
        try {
            return await salesService.getTopProductsByQuantity(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter produtos mais vendidos' };
        }
    });

    app.get('/produtos/maior-valor', async ({ query }) => {
        try {
            return await salesService.getTopProductsByValue(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter produtos de maior valor' };
        }
    });

    app.get('/produtos/variacao-preco', async ({ query }) => {
        try {
            return await salesService.getPriceVariationByProduct(query);
        } catch (error) {
            return { status: 500, message: 'Erro ao obter variação de preço dos produtos' };
        }
    });
};
