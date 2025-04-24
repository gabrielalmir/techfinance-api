import { Elysia } from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productService, salesService } from '../config/deps';
import { productsRoutes } from './product.route';

describe('Product Routes', () => {
    let app: Elysia;

    beforeEach(() => {
        app = new Elysia();
        productsRoutes(app);
    });

    describe('GET /produtos', () => {
        it('should return products with default pagination', async () => {
            const mockProducts = [{
                codigo: '123',
                descricao_produto: 'Test Product',
                descricao_grupo: 'Test Group',
                id_grupo: '1'
            }];
            vi.spyOn(productService, 'getProducts').mockResolvedValue(mockProducts);

            const response = await app.handle(
                new Request('http://localhost/produtos')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockProducts);
            expect(productService.getProducts).toHaveBeenCalledWith({
                name: '',
                group: '',
                limit: 10,
                offset: 0
            });
        });

        it('should return products with custom pagination', async () => {
            const mockProducts = [{
                codigo: '123',
                descricao_produto: 'Test Product',
                descricao_grupo: 'Test Group',
                id_grupo: '1'
            }];
            vi.spyOn(productService, 'getProducts').mockResolvedValue(mockProducts);

            const response = await app.handle(
                new Request('http://localhost/produtos?limite=20&pagina=2&nome=test&grupo=test')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockProducts);
            expect(productService.getProducts).toHaveBeenCalledWith({
                name: 'test',
                group: 'test',
                limit: 20,
                offset: 20
            });
        });

        it('should handle errors gracefully', async () => {
            vi.spyOn(productService, 'getProducts').mockRejectedValue(new Error('Test error'));

            const response = await app.handle(
                new Request('http://localhost/produtos')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({
                status: 500,
                message: 'Erro ao obter produtos'
            });
        });
    });

    describe('GET /produtos/mais-vendidos', () => {
        it('should return top products by quantity', async () => {
            const mockTopProducts = [{
                codigo: '123',
                descricao_produto: 'Test Product',
                descricao_grupo: 'Test Group',
                id_grupo: '1',
                quantidade: 100
            }];
            vi.spyOn(salesService, 'getTopProductsByQuantity').mockResolvedValue(mockTopProducts);

            const response = await app.handle(
                new Request('http://localhost/produtos/mais-vendidos')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockTopProducts);
        });

        it('should handle errors gracefully', async () => {
            vi.spyOn(salesService, 'getTopProductsByQuantity').mockRejectedValue(new Error('Test error'));

            const response = await app.handle(
                new Request('http://localhost/produtos/mais-vendidos')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({
                status: 500,
                message: 'Erro ao obter produtos mais vendidos'
            });
        });
    });

    describe('GET /produtos/maior-valor', () => {
        it('should return top products by value', async () => {
            const mockTopProducts = [{ id: 1, name: 'Test Product', value: 1000 }];
            vi.spyOn(salesService, 'getTopProductsByValue').mockResolvedValue(mockTopProducts);

            const response = await app.handle(
                new Request('http://localhost/produtos/maior-valor')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockTopProducts);
        });

        it('should handle errors gracefully', async () => {
            vi.spyOn(salesService, 'getTopProductsByValue').mockRejectedValue(new Error('Test error'));

            const response = await app.handle(
                new Request('http://localhost/produtos/maior-valor')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({
                status: 500,
                message: 'Erro ao obter produtos de maior valor'
            });
        });
    });

    describe('GET /produtos/variacao-preco', () => {
        it('should return price variation by product', async () => {
            const mockVariations = [{ id: 1, name: 'Test Product', variation: 10 }];
            vi.spyOn(salesService, 'getPriceVariationByProduct').mockResolvedValue(mockVariations);

            const response = await app.handle(
                new Request('http://localhost/produtos/variacao-preco')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockVariations);
        });

        it('should handle errors gracefully', async () => {
            vi.spyOn(salesService, 'getPriceVariationByProduct').mockRejectedValue(new Error('Test error'));

            const response = await app.handle(
                new Request('http://localhost/produtos/variacao-preco')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({
                status: 500,
                message: 'Erro ao obter variação de preço dos produtos'
            });
        });
    });
});
