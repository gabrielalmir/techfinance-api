import { Elysia } from 'elysia';
import { productService, salesService } from '../config/deps';

export const productsRoutes = (app: Elysia) => {
    app.get('/produtos', async ({ query }) => {
        try {
            return await productService.getProducts(query);
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
