export interface LatencyThresholds {
  healthCheck: number;
  simpleQuery: number;
  complexQuery: number;
  postOperation: number;
  loadTest: {
    minRequestsPerSecond: number;
    maxAvgResponseTime: number;
    minSuccessRate: number;
  };
}

export interface LatencyTestConfig {
  environments: {
    development: {
      baseUrl: string;
      thresholds: LatencyThresholds;
    };
    staging: {
      baseUrl: string;
      thresholds: LatencyThresholds;
    };
    production: {
      baseUrl: string;
      thresholds: LatencyThresholds;
    };
  };
  loadTest: {
    concurrent: number;
    total: number;
    sustainedLoad: {
      concurrent: number;
      total: number;
      duration: number; // in seconds
    };
  };
  reporting: {
    generateHtmlReport: boolean;
    generateJsonReport: boolean;
    logToConsole: boolean;
  };
}

export const latencyConfig: LatencyTestConfig = {
  environments: {
    development: {
      baseUrl: 'http://localhost:3000',
      thresholds: {
        healthCheck: 100,
        simpleQuery: 2000,
        complexQuery: 5000,
        postOperation: 3000,
        loadTest: {
          minRequestsPerSecond: 5,
          maxAvgResponseTime: 3000,
          minSuccessRate: 90,
        },
      },
    },
    staging: {
      baseUrl: 'https://staging-api.techfinance.com',
      thresholds: {
        healthCheck: 200,
        simpleQuery: 1500,
        complexQuery: 3000,
        postOperation: 2000,
        loadTest: {
          minRequestsPerSecond: 10,
          maxAvgResponseTime: 2000,
          minSuccessRate: 95,
        },
      },
    },
    production: {
      baseUrl: 'https://api.techfinance.com',
      thresholds: {
        healthCheck: 50,
        simpleQuery: 1000,
        complexQuery: 2000,
        postOperation: 1500,
        loadTest: {
          minRequestsPerSecond: 20,
          maxAvgResponseTime: 1000,
          minSuccessRate: 99,
        },
      },
    },
  },
  loadTest: {
    concurrent: 10,
    total: 50,
    sustainedLoad: {
      concurrent: 15,
      total: 150,
      duration: 30,
    },
  },
  reporting: {
    generateHtmlReport: true,
    generateJsonReport: true,
    logToConsole: true,
  },
};

export const endpointCategories = {
  health: ['/'],
  simple: ['/produtos', '/clientes', '/vendas'],
  complex: [
    '/produtos/mais-vendidos',
    '/produtos/maior-valor',
    '/produtos/variacao-preco',
    '/empresas/participacao',
    '/empresas/participacao-por-valor',
    '/contas_receber/resumo',
  ],
  posts: [
    { endpoint: '/mcp/contexts', body: { name: 'test', description: 'test context' } },
    { endpoint: '/mcp', body: { method: 'tools/list', params: {} } },
  ],
  authenticated: [
    '/produtos',
    '/clientes', 
    '/vendas',
    '/contas_receber/resumo',
    '/mcp/tools',
  ],
  unauthenticated: ['/'],
};

export function getEnvironmentConfig(env: 'development' | 'staging' | 'production' = 'development') {
  return latencyConfig.environments[env];
}

export function getThresholdForEndpoint(endpoint: string, env: 'development' | 'staging' | 'production' = 'development'): number {
  const config = getEnvironmentConfig(env);
  
  if (endpointCategories.health.includes(endpoint)) {
    return config.thresholds.healthCheck;
  }
  
  if (endpointCategories.simple.includes(endpoint)) {
    return config.thresholds.simpleQuery;
  }
  
  if (endpointCategories.complex.includes(endpoint)) {
    return config.thresholds.complexQuery;
  }
  
  if (endpointCategories.posts.some(p => p.endpoint === endpoint)) {
    return config.thresholds.postOperation;
  }
  
  // Default threshold for unknown endpoints
  return config.thresholds.simpleQuery;
} 