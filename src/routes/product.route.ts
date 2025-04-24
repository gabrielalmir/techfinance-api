import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { logger, productService, salesService } from '../config/deps';

export const productsRoutes = (app: Elysia) => {
    app.get('/produtos', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de produtos');

        const { nome = '', grupo = '', limite = 10, pagina = 1 } = query;
        const offset = (pagina - 1) * limite;

        const result = await tryCatchAsync(() =>
            productService.getProducts({ name: nome, group: grupo, limit: limite, offset })
        );

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao buscar produtos');
            return { status: 500, message: 'Erro ao obter produtos' };
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de produtos concluída com sucesso');

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
        logger.info({ query }, 'Iniciando busca de produtos mais vendidos');

        const result = await tryCatchAsync(() => salesService.getTopProductsByQuantity(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao buscar produtos mais vendidos');
            return { status: 500, message: 'Erro ao obter produtos mais vendidos' };
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de produtos mais vendidos concluída com sucesso');

        return result.value;
    });

    app.get('/produtos/maior-valor', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de produtos de maior valor');

        const result = await tryCatchAsync(() => salesService.getTopProductsByValue(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao buscar produtos de maior valor');
            return { status: 500, message: 'Erro ao obter produtos de maior valor' };
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de produtos de maior valor concluída com sucesso');

        return result.value;
    });

    app.get('/produtos/variacao-preco', async ({ query }) => {
        logger.info({ query }, 'Iniciando busca de variação de preço dos produtos');

        const result = await tryCatchAsync(() => salesService.getPriceVariationByProduct(query));

        if (!result.ok) {
            logger.error({ error: result.error, query }, 'Erro ao buscar variação de preço dos produtos');
            return { status: 500, message: 'Erro ao obter variação de preço dos produtos' };
        }

        logger.info({
            total: result.value.length,
            query
        }, 'Busca de variação de preço dos produtos concluída com sucesso');

        return result.value;
    });
};
