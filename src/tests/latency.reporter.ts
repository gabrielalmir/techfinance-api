import { writeFileSync } from 'fs';
import { join } from 'path';

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

interface LatencyTestReport {
  timestamp: string;
  environment: string;
  totalTests: number;
  successRate: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  results: LatencyResult[];
  loadTestResults: LoadTestResult[];
  summary: {
    healthChecks: {
      count: number;
      avgResponseTime: number;
      successRate: number;
    };
    simpleQueries: {
      count: number;
      avgResponseTime: number;
      successRate: number;
    };
    complexQueries: {
      count: number;
      avgResponseTime: number;
      successRate: number;
    };
    postOperations: {
      count: number;
      avgResponseTime: number;
      successRate: number;
    };
  };
  thresholdViolations: {
    endpoint: string;
    method: string;
    responseTime: number;
    threshold: number;
    violationType: 'latency' | 'success_rate' | 'load_performance';
  }[];
}

export class LatencyReporter {
  private reportDir: string;

  constructor(reportDir: string = './reports') {
    this.reportDir = reportDir;
  }

  generateReport(
    results: LatencyResult[],
    loadTestResults: LoadTestResult[],
    environment: string = 'development',
    thresholds: any = {}
  ): LatencyTestReport {
    const timestamp = new Date().toISOString();
    const successfulResults = results.filter(r => r.success);
    const responseTimes = successfulResults.map(r => r.responseTime);

    // Calculate summary statistics
    const summary = this.calculateSummary(results);
    const thresholdViolations = this.findThresholdViolations(results, loadTestResults, thresholds);

    const report: LatencyTestReport = {
      timestamp,
      environment,
      totalTests: results.length,
      successRate: (successfulResults.length / results.length) * 100,
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
      minResponseTime: Math.min(...responseTimes) || 0,
      maxResponseTime: Math.max(...responseTimes) || 0,
      results,
      loadTestResults,
      summary,
      thresholdViolations,
    };

    return report;
  }

  private calculateSummary(results: LatencyResult[]) {
    const healthEndpoints = ['/'];
    const simpleEndpoints = ['/produtos', '/clientes', '/vendas'];
    const complexEndpoints = [
      '/produtos/mais-vendidos',
      '/produtos/maior-valor', 
      '/produtos/variacao-preco',
      '/empresas/participacao',
      '/empresas/participacao-por-valor',
      '/contas_receber/resumo'
    ];
    const postEndpoints = ['/mcp/contexts', '/mcp'];

    const calculateCategoryStats = (endpoints: string[]) => {
      const categoryResults = results.filter(r => endpoints.includes(r.endpoint));
      const successful = categoryResults.filter(r => r.success);
      const responseTimes = successful.map(r => r.responseTime);
      
      return {
        count: categoryResults.length,
        avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
        successRate: categoryResults.length > 0 ? (successful.length / categoryResults.length) * 100 : 0,
      };
    };

    return {
      healthChecks: calculateCategoryStats(healthEndpoints),
      simpleQueries: calculateCategoryStats(simpleEndpoints),
      complexQueries: calculateCategoryStats(complexEndpoints),
      postOperations: calculateCategoryStats(postEndpoints),
    };
  }

  private findThresholdViolations(
    results: LatencyResult[],
    loadTestResults: LoadTestResult[],
    thresholds: any
  ) {
    const violations: any[] = [];

    // Check latency violations
    results.forEach(result => {
      if (result.success) {
        const threshold = this.getThresholdForEndpoint(result.endpoint, thresholds);
        if (result.responseTime > threshold) {
          violations.push({
            endpoint: result.endpoint,
            method: result.method,
            responseTime: result.responseTime,
            threshold,
            violationType: 'latency',
          });
        }
      }
    });

    // Check load test violations
    loadTestResults.forEach(result => {
      if (result.successRate < (thresholds.loadTest?.minSuccessRate || 90)) {
        violations.push({
          endpoint: result.endpoint,
          method: result.method,
          responseTime: result.avgResponseTime,
          threshold: thresholds.loadTest?.minSuccessRate || 90,
          violationType: 'success_rate',
        });
      }

      if (result.requestsPerSecond < (thresholds.loadTest?.minRequestsPerSecond || 5)) {
        violations.push({
          endpoint: result.endpoint,
          method: result.method,
          responseTime: result.requestsPerSecond,
          threshold: thresholds.loadTest?.minRequestsPerSecond || 5,
          violationType: 'load_performance',
        });
      }
    });

    return violations;
  }

  private getThresholdForEndpoint(endpoint: string, thresholds: any): number {
    if (endpoint === '/') return thresholds.healthCheck || 100;
    if (['/produtos', '/clientes', '/vendas'].includes(endpoint)) return thresholds.simpleQuery || 2000;
    if (endpoint.includes('/mcp')) return thresholds.postOperation || 3000;
    return thresholds.complexQuery || 5000;
  }

  saveJsonReport(report: LatencyTestReport, filename?: string): string {
    const fileName = filename || `latency-report-${Date.now()}.json`;
    const filePath = join(this.reportDir, fileName);
    
    try {
      writeFileSync(filePath, JSON.stringify(report, null, 2));
      return filePath;
    } catch (error) {
      console.error('Failed to save JSON report:', error);
      throw error;
    }
  }

  saveHtmlReport(report: LatencyTestReport, filename?: string): string {
    const fileName = filename || `latency-report-${Date.now()}.html`;
    const filePath = join(this.reportDir, fileName);
    
    const html = this.generateHtmlReport(report);
    
    try {
      writeFileSync(filePath, html);
      return filePath;
    } catch (error) {
      console.error('Failed to save HTML report:', error);
      throw error;
    }
  }

  private generateHtmlReport(report: LatencyTestReport): string {
    const violationsHtml = report.thresholdViolations.length > 0 
      ? report.thresholdViolations.map(v => `
          <tr class="violation">
            <td>${v.endpoint}</td>
            <td>${v.method}</td>
            <td>${v.responseTime.toFixed(2)}</td>
            <td>${v.threshold}</td>
            <td>${v.violationType}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="5" class="no-violations">No threshold violations found! 🎉</td></tr>';

    const resultsHtml = report.results.map(r => `
      <tr class="${r.success ? 'success' : 'failure'}">
        <td>${r.endpoint}</td>
        <td>${r.method}</td>
        <td>${r.responseTime.toFixed(2)}ms</td>
        <td>${r.statusCode}</td>
        <td>${r.success ? '✅' : '❌'}</td>
        <td>${r.error || '-'}</td>
      </tr>
    `).join('');

    const loadTestHtml = report.loadTestResults.map(r => `
      <tr>
        <td>${r.endpoint}</td>
        <td>${r.method}</td>
        <td>${r.concurrentRequests}</td>
        <td>${r.totalRequests}</td>
        <td>${r.avgResponseTime.toFixed(2)}ms</td>
        <td>${r.successRate.toFixed(2)}%</td>
        <td>${r.requestsPerSecond.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latency Test Report - ${report.environment}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2 { color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .success { background-color: #f8fff8; }
        .failure { background-color: #fff8f8; }
        .violation { background-color: #ffebee; }
        .no-violations { text-align: center; color: #28a745; font-weight: bold; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .summary-title { font-weight: bold; color: #333; margin-bottom: 10px; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .timestamp { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Latency Test Report</h1>
            <p>Environment: <strong>${report.environment}</strong></p>
            <p class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${report.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.successRate.toFixed(2)}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.avgResponseTime.toFixed(2)}ms</div>
                <div class="stat-label">Avg Response Time</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${report.thresholdViolations.length}</div>
                <div class="stat-label">Threshold Violations</div>
            </div>
        </div>

        <h2>📊 Summary by Category</h2>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-title">🔋 Health Checks</div>
                <div class="summary-item"><span>Count:</span><span>${report.summary.healthChecks.count}</span></div>
                <div class="summary-item"><span>Avg Time:</span><span>${report.summary.healthChecks.avgResponseTime.toFixed(2)}ms</span></div>
                <div class="summary-item"><span>Success Rate:</span><span>${report.summary.healthChecks.successRate.toFixed(2)}%</span></div>
            </div>
            <div class="summary-card">
                <div class="summary-title">📝 Simple Queries</div>
                <div class="summary-item"><span>Count:</span><span>${report.summary.simpleQueries.count}</span></div>
                <div class="summary-item"><span>Avg Time:</span><span>${report.summary.simpleQueries.avgResponseTime.toFixed(2)}ms</span></div>
                <div class="summary-item"><span>Success Rate:</span><span>${report.summary.simpleQueries.successRate.toFixed(2)}%</span></div>
            </div>
            <div class="summary-card">
                <div class="summary-title">🔍 Complex Queries</div>
                <div class="summary-item"><span>Count:</span><span>${report.summary.complexQueries.count}</span></div>
                <div class="summary-item"><span>Avg Time:</span><span>${report.summary.complexQueries.avgResponseTime.toFixed(2)}ms</span></div>
                <div class="summary-item"><span>Success Rate:</span><span>${report.summary.complexQueries.successRate.toFixed(2)}%</span></div>
            </div>
            <div class="summary-card">
                <div class="summary-title">📤 POST Operations</div>
                <div class="summary-item"><span>Count:</span><span>${report.summary.postOperations.count}</span></div>
                <div class="summary-item"><span>Avg Time:</span><span>${report.summary.postOperations.avgResponseTime.toFixed(2)}ms</span></div>
                <div class="summary-item"><span>Success Rate:</span><span>${report.summary.postOperations.successRate.toFixed(2)}%</span></div>
            </div>
        </div>

        <h2>⚠️ Threshold Violations</h2>
        <table>
            <thead>
                <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Actual Value</th>
                    <th>Threshold</th>
                    <th>Violation Type</th>
                </tr>
            </thead>
            <tbody>
                ${violationsHtml}
            </tbody>
        </table>

        <h2>📋 Detailed Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Response Time</th>
                    <th>Status Code</th>
                    <th>Success</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
                ${resultsHtml}
            </tbody>
        </table>

        ${report.loadTestResults.length > 0 ? `
        <h2>🔥 Load Test Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Concurrent</th>
                    <th>Total Requests</th>
                    <th>Avg Response Time</th>
                    <th>Success Rate</th>
                    <th>Requests/Second</th>
                </tr>
            </thead>
            <tbody>
                ${loadTestHtml}
            </tbody>
        </table>
        ` : ''}
    </div>
</body>
</html>`;
  }
} 