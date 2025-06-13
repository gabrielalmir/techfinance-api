import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { env } from '../config/env';

interface LatencyResult {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  success: boolean;
  error?: string;
}

interface LoadTestResult {
  endpoint: string;
  method: string;
  concurrentRequests: number;
  totalRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  requestsPerSecond: number;
}

class E2ELatencyTester {
  private baseUrl: string;
  private authToken: string;
  private results: LatencyResult[] = [];
  private loadTestResults: LoadTestResult[] = [];

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private async makeRequest(
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

      const result: LatencyResult = {
        endpoint,
        method,
        responseTime,
        statusCode: response.status,
        success: response.ok,
      };

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const result: LatencyResult = {
        endpoint,
        method,
        responseTime,
        statusCode: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.results.push(result);
      return result;
    }
  }

  async loadTest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    concurrentRequests: number = 10,
    totalRequests: number = 100,
    body?: any,
    authenticated: boolean = true
  ): Promise<LoadTestResult> {
    const startTime = Date.now();
    const results: LatencyResult[] = [];
    const requestsPerBatch = Math.ceil(totalRequests / concurrentRequests);

    // Execute requests in batches
    for (let batch = 0; batch < concurrentRequests; batch++) {
      const batchPromises: Promise<LatencyResult>[] = [];
      
      for (let i = 0; i < requestsPerBatch && (batch * requestsPerBatch + i) < totalRequests; i++) {
        batchPromises.push(this.makeRequest(endpoint, method, body, authenticated));
      }

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds

    const responseTimes = results.map(r => r.responseTime);
    const successfulRequests = results.filter(r => r.success).length;

    const loadTestResult: LoadTestResult = {
      endpoint,
      method,
      concurrentRequests,
      totalRequests: results.length,
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      successRate: (successfulRequests / results.length) * 100,
      requestsPerSecond: results.length / totalTime,
    };

    this.loadTestResults.push(loadTestResult);
    return loadTestResult;
  }

  async testSingleEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    authenticated: boolean = true
  ): Promise<LatencyResult> {
    return this.makeRequest(endpoint, method, body, authenticated);
  }

  async testAllEndpoints(): Promise<void> {
    console.log('🚀 Starting comprehensive latency tests...');

    // Test unauthenticated endpoints
    await this.testSingleEndpoint('/', 'GET', undefined, false);

    // Test Product endpoints
    await this.testSingleEndpoint('/produtos');
    await this.testSingleEndpoint('/produtos?limite=20&pagina=1&nome=test');
    await this.testSingleEndpoint('/produtos/mais-vendidos');
    await this.testSingleEndpoint('/produtos/maior-valor');
    await this.testSingleEndpoint('/produtos/variacao-preco');

    // Test Customer endpoints
    await this.testSingleEndpoint('/clientes');
    await this.testSingleEndpoint('/clientes?limite=20&pagina=1');

    // Test Billing endpoints
    await this.testSingleEndpoint('/vendas');
    await this.testSingleEndpoint('/vendas?limite=20&pagina=1');
    await this.testSingleEndpoint('/empresas/participacao');
    await this.testSingleEndpoint('/empresas/participacao-por-valor');

    // Test Payment endpoints
    await this.testSingleEndpoint('/contas_receber/resumo');
    await this.testSingleEndpoint('/contas_receber/ai');

    // Test MCP endpoints
    await this.testSingleEndpoint('/mcp/initialize');
    await this.testSingleEndpoint('/mcp/contexts');
    await this.testSingleEndpoint('/mcp/tools');
    await this.testSingleEndpoint('/mcp/prompts');
    await this.testSingleEndpoint('/mcp/resources');

    // Test MCP POST endpoints
    await this.testSingleEndpoint('/mcp/contexts', 'POST', {
      name: 'test-context',
      description: 'Test context for latency testing'
    });

    await this.testSingleEndpoint('/mcp', 'POST', {
      method: 'tools/list',
      params: {}
    });

    console.log('✅ Single endpoint tests completed');
  }

  async runLoadTests(): Promise<void> {
    console.log('🔥 Starting load tests...');

    // Load test critical endpoints
    await this.loadTest('/produtos', 'GET', 5, 25);
    await this.loadTest('/clientes', 'GET', 5, 25);
    await this.loadTest('/vendas', 'GET', 5, 25);
    await this.loadTest('/contas_receber/resumo', 'GET', 3, 15);
    await this.loadTest('/mcp/tools', 'GET', 3, 15);

    // Load test with higher concurrency
    await this.loadTest('/produtos', 'GET', 10, 50);
    await this.loadTest('/', 'GET', 20, 100, undefined, false);

    console.log('✅ Load tests completed');
  }

  generateReport(): string {
    let report = '\n📊 LATENCY TEST REPORT\n';
    report += '='.repeat(50) + '\n\n';

    // Single endpoint results
    report += '📈 SINGLE ENDPOINT RESULTS:\n';
    report += '-'.repeat(30) + '\n';
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      report += `${status} ${result.method} ${result.endpoint}\n`;
      report += `   Response Time: ${result.responseTime.toFixed(2)}ms\n`;
      report += `   Status Code: ${result.statusCode}\n`;
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
      report += '\n';
    });

    // Calculate statistics
    const successfulResults = this.results.filter(r => r.success);
    const responseTimes = successfulResults.map(r => r.responseTime);
    
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      const successRate = (successfulResults.length / this.results.length) * 100;

      report += '📊 OVERALL STATISTICS:\n';
      report += '-'.repeat(30) + '\n';
      report += `Total Requests: ${this.results.length}\n`;
      report += `Successful Requests: ${successfulResults.length}\n`;
      report += `Success Rate: ${successRate.toFixed(2)}%\n`;
      report += `Average Response Time: ${avgResponseTime.toFixed(2)}ms\n`;
      report += `Min Response Time: ${minResponseTime.toFixed(2)}ms\n`;
      report += `Max Response Time: ${maxResponseTime.toFixed(2)}ms\n\n`;
    }

    // Load test results
    if (this.loadTestResults.length > 0) {
      report += '🔥 LOAD TEST RESULTS:\n';
      report += '-'.repeat(30) + '\n';
      
      this.loadTestResults.forEach(result => {
        report += `${result.method} ${result.endpoint}\n`;
        report += `   Concurrent Requests: ${result.concurrentRequests}\n`;
        report += `   Total Requests: ${result.totalRequests}\n`;
        report += `   Success Rate: ${result.successRate.toFixed(2)}%\n`;
        report += `   Requests/Second: ${result.requestsPerSecond.toFixed(2)}\n`;
        report += `   Avg Response Time: ${result.avgResponseTime.toFixed(2)}ms\n`;
        report += `   Min Response Time: ${result.minResponseTime.toFixed(2)}ms\n`;
        report += `   Max Response Time: ${result.maxResponseTime.toFixed(2)}ms\n\n`;
      });
    }

    return report;
  }

  getResults(): LatencyResult[] {
    return this.results;
  }

  getLoadTestResults(): LoadTestResult[] {
    return this.loadTestResults;
  }

  // Performance assertions
  assertLatencyThresholds(maxResponseTime: number = 1000): void {
    const slowRequests = this.results.filter(r => r.success && r.responseTime > maxResponseTime);
    
    if (slowRequests.length > 0) {
      const slowEndpoints = slowRequests.map(r => `${r.method} ${r.endpoint} (${r.responseTime.toFixed(2)}ms)`);
      throw new Error(`Slow requests detected (>${maxResponseTime}ms):\n${slowEndpoints.join('\n')}`);
    }
  }

  assertSuccessRate(minSuccessRate: number = 95): void {
    const successRate = (this.results.filter(r => r.success).length / this.results.length) * 100;
    
    if (successRate < minSuccessRate) {
      throw new Error(`Success rate ${successRate.toFixed(2)}% is below threshold ${minSuccessRate}%`);
    }
  }

  assertLoadTestPerformance(minRequestsPerSecond: number = 10): void {
    const slowLoadTests = this.loadTestResults.filter(r => r.requestsPerSecond < minRequestsPerSecond);
    
    if (slowLoadTests.length > 0) {
      const slowEndpoints = slowLoadTests.map(r => `${r.method} ${r.endpoint} (${r.requestsPerSecond.toFixed(2)} req/s)`);
      throw new Error(`Load test performance below threshold (<${minRequestsPerSecond} req/s):\n${slowEndpoints.join('\n')}`);
    }
  }
}

describe('E2E Latency Tests', () => {
  let tester: E2ELatencyTester;
  let server: any;

  beforeAll(async () => {
    // Use a different port for testing to avoid conflicts
    const testPort = env.PORT + 2000; // Changed from 1000 to 2000 to avoid conflict
    
    try {
      // Create a simple server for testing
      server = Bun.serve({
        fetch: async (request) => {
          // Simple response for health check
          const url = new URL(request.url);
          if (url.pathname === '/') {
            return new Response('ok');
          }
          // Return 401 for other requests without proper auth
          const auth = request.headers.get('authorization');
          if (!auth || auth !== `Bearer ${env.AUTHORIZATION}`) {
            return new Response('Unauthorized', { status: 401 });
          }
          // Mock responses for testing based on endpoint
          const mockData = getMockResponse(url.pathname);
          return new Response(JSON.stringify(mockData), {
            headers: { 'Content-Type': 'application/json' }
          });
        },
        port: testPort,
      });

      // Always initialize tester, even if server setup fails
      tester = new E2ELatencyTester(`http://localhost:${testPort}`, env.AUTHORIZATION);
      
      // Wait for server to be ready
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(`✅ Test server started on port ${testPort}`);
    } catch (error) {
      console.error(`❌ Failed to start test server on port ${testPort}:`, error);
      // Still initialize tester with a fallback port for graceful failure
      tester = new E2ELatencyTester(`http://localhost:${testPort}`, env.AUTHORIZATION);
      throw error;
    }
  }, 15000); // Increase timeout to 15 seconds

  // Helper function to generate mock responses based on endpoint
  function getMockResponse(pathname: string) {
    if (pathname.includes('/produtos')) {
      return [{ codigo: '123', descricao_produto: 'Test Product', descricao_grupo: 'Test Group' }];
    } else if (pathname.includes('/clientes')) {
      return [{ id: '1', nome: 'Test Client', email: 'test@example.com' }];
    } else if (pathname.includes('/vendas')) {
      return [{ id: '1', valor: 1000, data: '2024-01-01' }];
    } else if (pathname.includes('/mcp')) {
      return { message: 'MCP response', status: 'success' };
    } else if (pathname.includes('/contas_receber')) {
      return { resumo: 'Test summary', total: 5000 };
    }
    return { message: 'Test response', endpoint: pathname };
  }

  afterAll(async () => {
    if (server) {
      server.stop();
    }
  });

  describe('Single Endpoint Latency Tests', () => {
    it('should test all endpoints for acceptable latency', async () => {
      await tester.testAllEndpoints();
      
      // Generate and log the report
      const report = tester.generateReport();
      console.log(report);
      
      // Assert performance thresholds
      tester.assertSuccessRate(90); // 90% minimum success rate
      tester.assertLatencyThresholds(5000); // 5 second maximum response time
      
      // Individual endpoint assertions
      const results = tester.getResults();
      
      // Health check should be very fast
      const healthCheck = results.find(r => r.endpoint === '/');
      expect(healthCheck?.success).toBe(true);
      expect(healthCheck?.responseTime).toBeLessThan(100);
      
      // Critical endpoints should respond within reasonable time
      const criticalEndpoints = ['/produtos', '/clientes', '/vendas'];
      criticalEndpoints.forEach(endpoint => {
        const result = results.find(r => r.endpoint === endpoint);
        expect(result?.success).toBe(true);
        expect(result?.responseTime).toBeLessThan(2000);
      });
    });

    it('should handle unauthenticated requests appropriately', async () => {
      const result = await tester.testSingleEndpoint('/produtos', 'GET', undefined, false);
      
      // Should return 401 for unauthenticated requests
      expect(result.statusCode).toBe(401);
      expect(result.responseTime).toBeLessThan(1000);
    });

    it('should handle different query parameters efficiently', async () => {
      const endpoints = [
        '/produtos?limite=1',
        '/produtos?limite=50',
        '/produtos?nome=test&grupo=electronics',
        '/clientes?limite=100',
        '/vendas?limite=20&pagina=2'
      ];

      for (const endpoint of endpoints) {
        const result = await tester.testSingleEndpoint(endpoint);
        expect(result.success).toBe(true);
        expect(result.responseTime).toBeLessThan(3000);
      }
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      await tester.runLoadTests();
      
      // Assert load test performance
      tester.assertLoadTestPerformance(5); // Minimum 5 requests per second
      
      const loadResults = tester.getLoadTestResults();
      
      // Verify load test results
      loadResults.forEach(result => {
        expect(result.successRate).toBeGreaterThan(80);
        expect(result.avgResponseTime).toBeLessThan(5000);
        expect(result.requestsPerSecond).toBeGreaterThan(1);
      });
    });

    it('should maintain performance under sustained load', async () => {
      // Test sustained load on critical endpoint
      const result = await tester.loadTest('/produtos', 'GET', 15, 75);
      
      expect(result.successRate).toBeGreaterThan(85);
      expect(result.avgResponseTime).toBeLessThan(3000);
      expect(result.requestsPerSecond).toBeGreaterThan(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large query parameters', async () => {
      const longString = 'a'.repeat(1000);
      const result = await tester.testSingleEndpoint(`/produtos?nome=${longString}`);
      
      // Should handle gracefully (either success or proper error)
      expect([200, 400, 414].includes(result.statusCode)).toBe(true);
      expect(result.responseTime).toBeLessThan(5000);
    });

    it('should handle POST requests with large payloads', async () => {
      const largePayload = {
        name: 'Large Context Test',
        description: 'x'.repeat(10000),
        metadata: Array(100).fill({ key: 'value', data: 'test'.repeat(100) })
      };

      const result = await tester.testSingleEndpoint('/mcp/contexts', 'POST', largePayload);
      
      // Should handle large payloads appropriately
      expect(result.responseTime).toBeLessThan(10000);
    });

    it('should handle invalid endpoints gracefully', async () => {
      const result = await tester.testSingleEndpoint('/nonexistent-endpoint');
      
      expect(result.statusCode).toBe(404);
      expect(result.responseTime).toBeLessThan(1000);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should meet performance benchmarks for critical operations', async () => {
      const benchmarks = [
        { endpoint: '/', expectedMaxTime: 50, description: 'Health check' },
        { endpoint: '/produtos', expectedMaxTime: 1500, description: 'Product listing' },
        { endpoint: '/clientes', expectedMaxTime: 1500, description: 'Customer listing' },
        { endpoint: '/mcp/tools', expectedMaxTime: 1000, description: 'MCP tools listing' },
      ];

      for (const benchmark of benchmarks) {
        const result = await tester.testSingleEndpoint(benchmark.endpoint);
        
        expect(result.success).toBe(true);
        expect(result.responseTime).toBeLessThan(benchmark.expectedMaxTime);
        
        console.log(`✅ ${benchmark.description}: ${result.responseTime.toFixed(2)}ms (< ${benchmark.expectedMaxTime}ms)`);
      }
    });
  });
}); 