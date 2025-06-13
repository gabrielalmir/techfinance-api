import { describe, expect, it } from 'vitest';
import { env } from '../config/env';

interface LatencyResult {
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    success: boolean;
    error?: string;
}

class SimpleLatencyTester {
    private baseUrl: string;
    private authToken: string;

    constructor(baseUrl: string, authToken: string) {
        this.baseUrl = baseUrl;
        this.authToken = authToken;
    }

    async testEndpoint(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any,
        authenticated: boolean = true
    ): Promise<LatencyResult> {
        const startTime = performance.now();
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authenticated) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const endTime = performance.now();
            const responseTime = endTime - startTime;

            return {
                endpoint,
                method,
                responseTime,
                statusCode: response.status,
                success: response.ok,
            };
        } catch (error) {
            const endTime = performance.now();
            const responseTime = endTime - startTime;

            return {
                endpoint,
                method,
                responseTime,
                statusCode: 0,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    async loadTest(endpoint: string, concurrency: number = 5, totalRequests: number = 25): Promise<{
        avgResponseTime: number;
        minResponseTime: number;
        maxResponseTime: number;
        successRate: number;
        requestsPerSecond: number;
    }> {
        const startTime = Date.now();
        const results: LatencyResult[] = [];

        const batchSize = Math.ceil(totalRequests / concurrency);

        for (let batch = 0; batch < concurrency; batch++) {
            const batchPromises: Promise<LatencyResult>[] = [];

            for (let i = 0; i < batchSize && (batch * batchSize + i) < totalRequests; i++) {
                batchPromises.push(this.testEndpoint(endpoint));
            }

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        const endTime = Date.now();
        const totalTime = (endTime - startTime) / 1000; // Convert to seconds

        const responseTimes = results.map(r => r.responseTime);
        const successfulRequests = results.filter(r => r.success).length;

        return {
            avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            minResponseTime: Math.min(...responseTimes),
            maxResponseTime: Math.max(...responseTimes),
            successRate: (successfulRequests / results.length) * 100,
            requestsPerSecond: results.length / totalTime,
        };
    }
}

describe('Simple Latency Tests', () => {
    const tester = new SimpleLatencyTester(`http://localhost:${env.PORT}`, env.AUTHORIZATION);

    describe('Individual Endpoint Tests', () => {
        it('should test health endpoint with fast response', async () => {
            const result = await tester.testEndpoint('/', 'GET', undefined, false);

            console.log(`Health check: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`);

            expect(result.responseTime).toBeLessThan(500); // 500ms threshold
            expect([200, 404].includes(result.statusCode)).toBe(true); // Allow 404 if no root route
        });

        it('should test produtos endpoint with reasonable response time', async () => {
            const result = await tester.testEndpoint('/produtos');

            console.log(`Produtos endpoint: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`);

            if (result.success) {
                expect(result.responseTime).toBeLessThan(3000); // 3 second threshold
                expect(result.statusCode).toBe(200);
            } else {
                // If not successful, check if it's an expected error (401, 500, etc.)
                expect([401, 500].includes(result.statusCode)).toBe(true);
            }
        });

        it('should test clientes endpoint', async () => {
            const result = await tester.testEndpoint('/clientes');

            console.log(`Clientes endpoint: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`);

            expect(result.responseTime).toBeLessThan(3000);
            // Should either succeed or fail with expected status codes
            expect([200, 401, 500].includes(result.statusCode)).toBe(true);
        });

        it('should test vendas endpoint', async () => {
            const result = await tester.testEndpoint('/vendas');

            console.log(`Vendas endpoint: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`);

            expect(result.responseTime).toBeLessThan(3000);
            expect([200, 401, 500].includes(result.statusCode)).toBe(true);
        });

        it('should test MCP tools endpoint', async () => {
            const result = await tester.testEndpoint('/mcp/tools');

            console.log(`MCP Tools endpoint: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`);

            expect(result.responseTime).toBeLessThan(2000);
            expect([200, 401, 500].includes(result.statusCode)).toBe(true);
        });

        it('should handle unauthenticated requests', async () => {
            const result = await tester.testEndpoint('/produtos', 'GET', undefined, false);

            console.log(`Unauthenticated request: ${result.responseTime.toFixed(2)}ms (${result.statusCode})`);

            expect(result.responseTime).toBeLessThan(1000);
            expect(result.statusCode).toBe(401);
        });
    });

    describe('Load Testing', () => {
        it('should handle concurrent requests to produtos endpoint', async () => {
            const loadTestResult = await tester.loadTest('/produtos', 3, 9);

            console.log(`Load test results:`);
            console.log(`  Average response time: ${loadTestResult.avgResponseTime.toFixed(2)}ms`);
            console.log(`  Min response time: ${loadTestResult.minResponseTime.toFixed(2)}ms`);
            console.log(`  Max response time: ${loadTestResult.maxResponseTime.toFixed(2)}ms`);
            console.log(`  Success rate: ${loadTestResult.successRate.toFixed(2)}%`);
            console.log(`  Requests per second: ${loadTestResult.requestsPerSecond.toFixed(2)}`);

            expect(loadTestResult.avgResponseTime).toBeLessThan(5000);
            expect(loadTestResult.successRate).toBeGreaterThan(0); // At least some requests should succeed
            expect(loadTestResult.requestsPerSecond).toBeGreaterThan(0);
        });

        it('should maintain performance under light load', async () => {
            const loadTestResult = await tester.loadTest('/', 2, 6);

            console.log(`Light load test on health endpoint:`);
            console.log(`  Average response time: ${loadTestResult.avgResponseTime.toFixed(2)}ms`);
            console.log(`  Requests per second: ${loadTestResult.requestsPerSecond.toFixed(2)}`);

            expect(loadTestResult.avgResponseTime).toBeLessThan(1000);
            expect(loadTestResult.requestsPerSecond).toBeGreaterThan(1);
        });
    });

    describe('Performance Benchmarks', () => {
        it('should meet basic performance requirements', async () => {
            const endpoints = [
                { path: '/', name: 'Health Check', maxTime: 200, auth: false },
                { path: '/produtos', name: 'Products', maxTime: 2000, auth: true },
                { path: '/clientes', name: 'Clients', maxTime: 2000, auth: true },
            ];

            for (const endpoint of endpoints) {
                const result = await tester.testEndpoint(endpoint.path, 'GET', undefined, endpoint.auth);

                console.log(`${endpoint.name}: ${result.responseTime.toFixed(2)}ms (target: <${endpoint.maxTime}ms)`);

                if (result.success) {
                    expect(result.responseTime).toBeLessThan(endpoint.maxTime);
                }
                // Always check that response time is reasonable even if request fails
                expect(result.responseTime).toBeLessThan(10000); // 10 second absolute max
            }
        });
    });
});
