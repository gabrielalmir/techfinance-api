import { Elysia } from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerService } from '../config/deps';
import { customerRoutes } from './customer.route';

describe('Customer Routes', () => {
    let app: Elysia;

    beforeEach(() => {
        app = new Elysia();
        customerRoutes(app);
    });

    describe('GET /clientes', () => {
        it('should return customers with default pagination', async () => {
            const mockCustomers = [{ id: 1, name: 'Test Customer' }];
            vi.spyOn(customerService, 'getCustomers').mockResolvedValue(mockCustomers);

            const response = await app.handle(
                new Request('http://localhost/clientes')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockCustomers);
            expect(customerService.getCustomers).toHaveBeenCalledWith({
                name: '',
                group: '',
                limit: 10,
                page: 1,
                offset: 0
            });
        });

        it('should return customers with custom pagination', async () => {
            const mockCustomers = [{ id: 1, name: 'Test Customer' }];
            vi.spyOn(customerService, 'getCustomers').mockResolvedValue(mockCustomers);

            const response = await app.handle(
                new Request('http://localhost/clientes?limite=20&pagina=2&nome=test&grupo=test')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockCustomers);
            expect(customerService.getCustomers).toHaveBeenCalledWith({
                name: 'test',
                group: 'test',
                limit: 20,
                page: 2,
                offset: 20
            });
        });

        it('should handle errors gracefully', async () => {
            vi.spyOn(customerService, 'getCustomers').mockRejectedValue(new Error('Test error'));

            const response = await app.handle(
                new Request('http://localhost/clientes')
            );

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual({
                status: 500,
                message: 'Erro ao obter clientes'
            });
        });
    });
});
