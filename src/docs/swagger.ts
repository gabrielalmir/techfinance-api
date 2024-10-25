export const swaggerConfig = {
    path: '/docs',
    documentation: {
        info: {
            title: 'TechFinance API',
            version: '1.0',
            description: 'TechFinance é uma solução mobile para para prover informações para apoio para tomada de decisões. Esta é uma API backend construída utilizando o framework **Fiber** (na linguagem Go).',
        },
        servers: [
            {
                url: 'https://techfinance.fly.dev',
            },
            {
                url: 'http://localhost:8080',
            }
        ],
    },
}
