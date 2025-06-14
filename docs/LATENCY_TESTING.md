# 🚀 E2E Latency Testing

This document describes the comprehensive end-to-end latency testing implementation for the TechFinance API.

## Overview

The latency testing suite provides:
- **Single endpoint testing** with detailed response time measurements
- **Load testing** with concurrent requests and performance metrics
- **Multi-environment support** (development, staging, production)
- **Comprehensive reporting** in HTML and JSON formats
- **Threshold-based assertions** with configurable limits
- **Automated test categorization** (health, simple, complex, POST operations)

## Quick Start

### Basic Latency Testing
```bash
# Run basic latency tests in development environment
bun run test:latency

# Run with load tests included
bun run test:latency:load

# Run full test suite with verbose output
bun run test:latency:full
```

### Environment-Specific Testing
```bash
# Test against development environment
bun run test:latency:dev

# Test against staging environment
bun run test:latency:staging

# Test against production environment
bun run test:latency:production
```

### Using the Test Runner Script
```bash
# Basic usage
bun run scripts/run-latency-tests.ts

# With custom options
bun run scripts/run-latency-tests.ts \
  --env staging \
  --load-tests \
  --format html \
  --output ./custom-reports \
  --verbose
```

## Test Structure

### Test Categories

1. **Health Checks** (`/`)
   - Expected response time: < 100ms (dev), < 50ms (prod)
   - Basic server availability

2. **Simple Queries** (`/produtos`, `/clientes`, `/vendas`)
   - Expected response time: < 2000ms (dev), < 1000ms (prod)
   - Basic data retrieval operations

3. **Complex Queries** (`/produtos/mais-vendidos`, `/empresas/participacao`)
   - Expected response time: < 5000ms (dev), < 2000ms (prod)
   - Advanced analytics and aggregations

4. **POST Operations** (`/mcp/contexts`, `/mcp`)
   - Expected response time: < 3000ms (dev), < 1500ms (prod)
   - Data creation and modification operations

### Load Testing Metrics

- **Concurrent Requests**: Number of simultaneous requests
- **Total Requests**: Total number of requests in the test
- **Success Rate**: Percentage of successful responses
- **Requests per Second**: Throughput measurement
- **Response Time Statistics**: Min, max, and average response times

## Configuration

### Environment Thresholds

The system uses different performance thresholds based on the environment:

```typescript
// Development environment (more lenient)
{
  healthCheck: 100,      // ms
  simpleQuery: 2000,     // ms
  complexQuery: 5000,    // ms
  postOperation: 3000,   // ms
}

// Production environment (strict)
{
  healthCheck: 50,       // ms
  simpleQuery: 1000,     // ms
  complexQuery: 2000,    // ms
  postOperation: 1500,   // ms
}
```

### Load Test Configuration

```typescript
{
  concurrent: 10,        // Concurrent requests
  total: 50,             // Total requests
  sustainedLoad: {
    concurrent: 15,      // Higher concurrency
    total: 150,          // More total requests
    duration: 30,        // Duration in seconds
  }
}
```

## Test Files

### Core Test Files

- `src/tests/e2e.latency.test.ts` - Main test suite
- `src/tests/latency.config.ts` - Configuration and thresholds
- `src/tests/latency.reporter.ts` - Report generation utilities
- `scripts/run-latency-tests.ts` - Test runner script

### File Structure
```
src/
├── tests/
│   ├── e2e.latency.test.ts      # Main test suite
│   ├── latency.config.ts        # Configuration
│   └── latency.reporter.ts      # Reporting utilities
scripts/
└── run-latency-tests.ts         # Test runner
reports/                         # Generated reports
└── *.html, *.json              # Test reports
```

## Features

### 1. Comprehensive Endpoint Testing

Tests all API endpoints including:
- Product endpoints (`/produtos/*`)
- Customer endpoints (`/clientes`)
- Billing endpoints (`/vendas`, `/empresas/*`)
- Payment endpoints (`/contas_receber/*`)
- MCP endpoints (`/mcp/*`)

### 2. Advanced Load Testing

- **Concurrent request simulation**
- **Sustained load testing**
- **Performance degradation detection**
- **Throughput measurement**

### 3. Detailed Reporting

**HTML Reports:**
- Visual dashboard with charts and statistics
- Color-coded results (success/failure)
- Threshold violation alerts
- Categorized performance summaries

**JSON Reports:**
- Machine-readable format
- Integration with CI/CD pipelines
- Historical performance tracking
- Detailed metrics for analysis

### 4. Threshold Management

- **Configurable thresholds** per environment
- **Automatic violation detection**
- **Performance regression alerts**
- **Category-based expectations**

## Usage Examples

### Running Specific Test Categories

```bash
# Test only health endpoints
bun test src/tests/e2e.latency.test.ts -t "health"

# Test only load performance
bun test src/tests/e2e.latency.test.ts -t "Load Testing"

# Test specific endpoints
bun test src/tests/e2e.latency.test.ts -t "produtos"
```

### Custom Test Runner Options

```bash
# Generate only HTML reports
bun run scripts/run-latency-tests.ts --format html

# Custom output directory
bun run scripts/run-latency-tests.ts --output ./performance-reports

# Test with custom server port
bun run scripts/run-latency-tests.ts --port 4000

# Skip report generation
bun run scripts/run-latency-tests.ts --no-reports
```

### Integration with CI/CD

```yaml
# GitHub Actions example
- name: Run Latency Tests
  run: |
    bun run test:latency:production --format json
    
- name: Upload Performance Reports
  uses: actions/upload-artifact@v3
  with:
    name: latency-reports
    path: reports/
```

## Interpreting Results

### Understanding Metrics

**Response Time:**
- Time from request initiation to response completion
- Includes network latency and server processing time

**Success Rate:**
- Percentage of requests that returned successful HTTP status codes
- Should be close to 100% for healthy endpoints

**Requests per Second (RPS):**
- Throughput metric indicating server capacity
- Higher values indicate better performance

**Threshold Violations:**
- Alerts when performance exceeds acceptable limits
- Categorized by violation type (latency, success rate, load performance)

### Common Performance Issues

1. **High Latency:**
   - Database query optimization needed
   - Caching implementation required
   - Network infrastructure issues

2. **Low Success Rate:**
   - Server overload or resource constraints
   - Authentication or authorization issues
   - Application errors or bugs

3. **Poor Load Performance:**
   - Insufficient server resources
   - Database connection pool limits
   - Memory leaks or resource cleanup issues

## Best Practices

### 1. Regular Testing
- Run latency tests as part of CI/CD pipeline
- Schedule periodic performance tests
- Monitor performance trends over time

### 2. Environment-Specific Thresholds
- Use appropriate thresholds for each environment
- Stricter limits for production
- More lenient limits for development

### 3. Gradual Load Testing
- Start with low concurrent requests
- Gradually increase load to find breaking points
- Monitor system resources during tests

### 4. Report Analysis
- Review HTML reports for visual insights
- Use JSON reports for automated analysis
- Track performance trends over multiple test runs

## Troubleshooting

### Common Issues

**Server Won't Start:**
- Check if port is already in use
- Verify environment variables are set
- Ensure database connectivity

**Tests Timeout:**
- Increase test timeout values
- Check server resource availability
- Verify network connectivity

**High Response Times:**
- Check database performance
- Review server logs for errors
- Monitor system resource usage

**Authentication Failures:**
- Verify authorization token is correct
- Check environment variable setup
- Ensure server is configured properly

### Debug Mode

Enable verbose logging for detailed output:
```bash
bun run scripts/run-latency-tests.ts --verbose
```

This will show:
- Detailed request/response information
- Server startup logs
- Test execution progress
- Error details and stack traces

## Contributing

When adding new endpoints or modifying existing ones:

1. **Update test configuration** in `latency.config.ts`
2. **Add endpoint to appropriate category** (health, simple, complex, posts)
3. **Set appropriate thresholds** for different environments
4. **Update test suite** in `e2e.latency.test.ts` if needed
5. **Test thoroughly** across all environments

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Main README](./README.md) 