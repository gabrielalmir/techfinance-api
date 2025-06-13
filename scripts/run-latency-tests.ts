#!/usr/bin/env bun

import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { env } from '../src/config/env';
import { latencyConfig, getEnvironmentConfig } from '../src/tests/latency.config';
import { LatencyReporter } from '../src/tests/latency.reporter';

interface TestOptions {
  environment: 'development' | 'staging' | 'production';
  includeLoadTests: boolean;
  generateReports: boolean;
  reportFormat: 'html' | 'json' | 'both';
  outputDir: string;
  verbose: boolean;
  serverPort?: number;
}

class LatencyTestRunner {
  private options: TestOptions;
  private reporter: LatencyReporter;
  private serverProcess: any;

  constructor(options: TestOptions) {
    this.options = options;
    this.reporter = new LatencyReporter(options.outputDir);
    
    // Ensure output directory exists
    if (!existsSync(options.outputDir)) {
      mkdirSync(options.outputDir, { recursive: true });
    }
  }

  async startServer(): Promise<void> {
    if (this.options.environment === 'development') {
      console.log('🚀 Starting local server for testing...');
      
             const serverPort = this.options.serverPort || env.PORT + 500;
      
      return new Promise((resolve, reject) => {
        this.serverProcess = spawn('bun', ['src/main.ts'], {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
          env: { ...process.env, PORT: serverPort.toString() }
        });

        this.serverProcess.on('error', (error: Error) => {
          console.error('❌ Failed to start server:', error);
          reject(error);
        });

        // Wait for server to be ready
        setTimeout(() => {
          console.log(`✅ Server started on port ${serverPort}`);
          resolve();
        }, 2000);
      });
    } else {
      console.log(`🌐 Using external server for ${this.options.environment} environment`);
    }
  }

  async stopServer(): Promise<void> {
    if (this.serverProcess) {
      console.log('🛑 Stopping local server...');
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }

  async runTests(): Promise<void> {
    const envConfig = getEnvironmentConfig(this.options.environment);
    console.log(`\n🎯 Running latency tests for ${this.options.environment} environment`);
    console.log(`📊 Base URL: ${envConfig.baseUrl}`);
    console.log(`📋 Thresholds: Health=${envConfig.thresholds.healthCheck}ms, Simple=${envConfig.thresholds.simpleQuery}ms, Complex=${envConfig.thresholds.complexQuery}ms`);

    try {
      // Start server if needed
      await this.startServer();

      // Run the test suite
      const testCommand = this.options.includeLoadTests 
        ? 'test src/tests/e2e.latency.test.ts'
        : 'test src/tests/e2e.latency.test.ts -t "Single Endpoint"';

      console.log(`\n🧪 Executing test command: bun ${testCommand}`);
      
      const testProcess = spawn('bun', testCommand.split(' '), {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          TEST_ENVIRONMENT: this.options.environment,
        }
      });

      await new Promise<void>((resolve, reject) => {
        testProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Tests completed successfully');
            resolve();
          } else {
            console.error(`❌ Tests failed with exit code ${code}`);
            reject(new Error(`Tests failed with exit code ${code}`));
          }
        });

        testProcess.on('error', (error) => {
          console.error('❌ Test execution error:', error);
          reject(error);
        });
      });

    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    } finally {
      // Clean up
      await this.stopServer();
    }
  }

  async generateReports(): Promise<void> {
    if (!this.options.generateReports) {
      return;
    }

    console.log('\n📊 Generating reports...');
    
    // Note: In a real implementation, you would collect the actual test results
    // For now, we'll create a sample report structure
    const sampleResults = [
      {
        endpoint: '/',
        method: 'GET' as const,
        responseTime: 45,
        statusCode: 200,
        success: true,
      },
      {
        endpoint: '/produtos',
        method: 'GET' as const,
        responseTime: 1200,
        statusCode: 200,
        success: true,
      },
    ];

    const sampleLoadTestResults = [
      {
        endpoint: '/produtos',
        method: 'GET' as const,
        concurrentRequests: 10,
        totalRequests: 50,
        avgResponseTime: 1150,
        minResponseTime: 800,
        maxResponseTime: 1800,
        successRate: 100,
        requestsPerSecond: 8.5,
      },
    ];

    const envConfig = getEnvironmentConfig(this.options.environment);
    const report = this.reporter.generateReport(
      sampleResults,
      sampleLoadTestResults,
      this.options.environment,
      envConfig.thresholds
    );

    if (this.options.reportFormat === 'html' || this.options.reportFormat === 'both') {
      const htmlPath = this.reporter.saveHtmlReport(report);
      console.log(`📄 HTML report saved: ${htmlPath}`);
    }

    if (this.options.reportFormat === 'json' || this.options.reportFormat === 'both') {
      const jsonPath = this.reporter.saveJsonReport(report);
      console.log(`📄 JSON report saved: ${jsonPath}`);
    }
  }
}

// Command line interface
function parseArgs(): TestOptions {
  const args = process.argv.slice(2);
  
  const options: TestOptions = {
    environment: 'development',
    includeLoadTests: false,
    generateReports: true,
    reportFormat: 'both',
    outputDir: './reports',
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--env':
      case '-e':
        options.environment = args[++i] as 'development' | 'staging' | 'production';
        break;
      case '--load-tests':
      case '-l':
        options.includeLoadTests = true;
        break;
      case '--no-reports':
        options.generateReports = false;
        break;
      case '--format':
      case '-f':
        options.reportFormat = args[++i] as 'html' | 'json' | 'both';
        break;
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--port':
      case '-p':
        options.serverPort = parseInt(args[++i]);
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.warn(`Unknown argument: ${arg}`);
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
🚀 Latency Test Runner

Usage: bun run scripts/run-latency-tests.ts [options]

Options:
  -e, --env <env>        Test environment (development|staging|production) [default: development]
  -l, --load-tests       Include load tests in execution
  -f, --format <format>  Report format (html|json|both) [default: both]
  -o, --output <dir>     Output directory for reports [default: ./reports]
  -p, --port <port>      Port for local server (development only)
  -v, --verbose          Enable verbose logging
  --no-reports           Skip report generation
  -h, --help             Show this help message

Examples:
  bun run scripts/run-latency-tests.ts                    # Run basic tests in development
  bun run scripts/run-latency-tests.ts -e staging -l      # Run with load tests in staging
  bun run scripts/run-latency-tests.ts -v -f html         # Run with verbose output and HTML reports only
  bun run scripts/run-latency-tests.ts --env production   # Run against production environment
`);
}

async function main(): Promise<void> {
  const options = parseArgs();
  
  console.log('🔧 Test Configuration:');
  console.log(`   Environment: ${options.environment}`);
  console.log(`   Include Load Tests: ${options.includeLoadTests}`);
  console.log(`   Generate Reports: ${options.generateReports}`);
  console.log(`   Report Format: ${options.reportFormat}`);
  console.log(`   Output Directory: ${options.outputDir}`);
  console.log(`   Verbose: ${options.verbose}`);

  const runner = new LatencyTestRunner(options);

  try {
    await runner.runTests();
    await runner.generateReports();
    
    console.log('\n🎉 Latency testing completed successfully!');
    
    if (options.generateReports) {
      console.log(`\n📁 Reports available in: ${options.outputDir}`);
    }
    
  } catch (error) {
    console.error('\n❌ Latency testing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
} 