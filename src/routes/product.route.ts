import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { productService, salesService } from '../config/deps';

export const productsRoutes = (app: Elysia) => {
    app.get('/produtos', async ({ query }) => {
        const { nome = '', grupo = '', limite = 10, pagina = 1 } = query;
        const offset = (pagina - 1) * limite;

        const result = await tryCatchAsync(() =>
            productService.getProducts({ name: nome, group: grupo, limit: limite, offset })
        );

        if (!result.ok) {
            return { status: 500, message: 'Erro ao obter produtos' };
        }

        return result.value;
    }, {
        query: t.Object({
            nome: t.Optional(t.String()),
            grupo: t.Optional(t.String()),
            limite: t.Optional(t.Number()),
            pagina: t.Optional(t.Number())
        })
    });

    app.get('/produtos/mais-vendidos', async ({ query }) => {
        const result = await tryCatchAsync(() => salesService.getTopProductsByQuantity(query));

        if (!result.ok) {
            return { status: 500, message: 'Erro ao obter produtos mais vendidos' };
        }

        return result.value;
    });

    app.get('/produtos/maior-valor', async ({ query }) => {
        const result = await tryCatchAsync(() => salesService.getTopProductsByValue(query));

        if (!result.ok) {
            return { status: 500, message: 'Erro ao obter produtos de maior valor' };
        }

        return result.value;
    });

    app.get('/produtos/variacao-preco', async ({ query }) => {
        const result = await tryCatchAsync(() => salesService.getPriceVariationByProduct(query));

        if (!result.ok) {
            return { status: 500, message: 'Erro ao obter variação de preço dos produtos' };
        }

        return result.value;
    });
};
