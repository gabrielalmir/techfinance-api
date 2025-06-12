# TechFinance API - Guia do Desenvolvedor

## Configuração do Ambiente

### Pré-requisitos
- **Bun.js** (versão mais recente)
- **Banco de dados** configurado conforme `drizzle.config.ts`
- **Variáveis de ambiente** configuradas

### Instalação
```bash
# Clone o repositório
git clone <repository_url>
cd api

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
bun run db:migrate

# Inicie o servidor de desenvolvimento
bun run dev
```

### Estrutura do Projeto

```
src/
├── config/         # Configurações e dependências
├── db/            # Schema e configuração do banco
├── docs/          # Configuração do Swagger
├── repositories/  # Camada de acesso aos dados
├── routes/        # Definição das rotas
├── services/      # Lógica de negócio
└── main.ts        # Ponto de entrada da aplicação
```

## Arquitetura

### Padrão de Camadas

1. **Routes**: Definição dos endpoints e validação de entrada
2. **Services**: Lógica de negócio e orquestração
3. **Repositories**: Acesso direto aos dados
4. **Database**: Camada de persistência

### Tecnologias Utilizadas

- **Elysia**: Framework web para Bun.js
- **TypeScript**: Linguagem de programação
- **Drizzle ORM**: ORM para banco de dados
- **Swagger**: Documentação automática da API
- **Vitest**: Framework de testes
- **Resulta**: Biblioteca para tratamento de erros

## Desenvolvimento

### Adicionando Novos Endpoints

1. **Criar o Repository** (se necessário):
```typescript
// src/repositories/exemplo.repository.ts
export class ExemploRepository {
    async findAll(filters: any) {
        // Implementação da consulta
    }
}
```

2. **Criar o Service**:
```typescript
// src/services/exemplo.service.ts
export class ExemploService {
    constructor(private repository: ExemploRepository) {}

    async getData(filters: any) {
        return this.repository.findAll(filters);
    }
}
```

3. **Criar a Route**:
```typescript
// src/routes/exemplo.route.ts
import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';

export const exemploRoutes = (app: Elysia) => {
    app.get('/exemplo', async ({ query }) => {
        const result = await tryCatchAsync(() =>
            exemploService.getData(query)
        );

        if (!result.ok) {
            return { status: 500, message: 'Erro interno' };
        }

        return result.value;
    }, {
        query: t.Object({
            filtro: t.Optional(t.String())
        })
    });
};
```

4. **Registrar a Route**:
```typescript
// src/routes/index.ts
import { exemploRoutes } from './exemplo.route';

// Adicionar dentro da configuração
exemploRoutes(routes);
```

### Testes

#### Executando Testes
```bash
# Todos os testes
bun test

# Testes específicos
bun test produto

# Testes em modo watch
bun test --watch
```

#### Estrutura de Teste
```typescript
import { Elysia } from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Exemplo Routes', () => {
    let app: Elysia;

    beforeEach(() => {
        app = new Elysia();
        exemploRoutes(app);
    });

    it('should return data successfully', async () => {
        // Mock do service
        vi.spyOn(exemploService, 'getData')
          .mockResolvedValue([{ id: 1 }]);

        const response = await app.handle(
            new Request('http://localhost/exemplo')
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual([{ id: 1 }]);
    });
});
```

### Tratamento de Erros

A API utiliza a biblioteca `resulta` para tratamento consistente de erros:

```typescript
import { tryCatchAsync } from 'resulta';

const result = await tryCatchAsync(() =>
    operacaoQuePodemFalhar()
);

if (!result.ok) {
    logger.error({ error: result.error }, 'Descrição do erro');
    return { status: 500, message: 'Mensagem amigável' };
}

return result.value;
```

### Logging

```typescript
import { logger } from '../config/deps';

// Log de informação
logger.info({ data }, 'Operação realizada com sucesso');

// Log de erro
logger.error({ error, context }, 'Erro na operação');

// Log de debug
logger.debug({ query }, 'Parâmetros recebidos');
```

### Validação de Dados

Utiliza o sistema de tipos do Elysia:

```typescript
app.get('/endpoint', async ({ query }) => {
    // query já está validado
}, {
    query: t.Object({
        nome: t.Optional(t.String()),
        idade: t.Number(),
        ativo: t.Boolean()
    })
});
```

## Banco de Dados

### Schema
O schema está definido em `src/db/schema.ts` usando Drizzle ORM.

### Migrações
```bash
# Gerar migração
bun run db:generate

# Aplicar migrações
bun run db:migrate

# Reset do banco (desenvolvimento)
bun run db:reset
```

### Consultas
```typescript
import { db } from '../db';
import { produtos } from '../db/schema';
import { like, and, sql } from 'drizzle-orm';

// Consulta básica
const result = await db.select().from(produtos);

// Consulta com filtros
const filtered = await db
    .select()
    .from(produtos)
    .where(
        and(
            like(produtos.descricao, `%${filtro}%`),
            eq(produtos.ativo, true)
        )
    )
    .limit(10)
    .offset(0);
```

## Deploy

### Produção (Fly.io)
```bash
# Deploy
flyctl deploy

# Logs
flyctl logs

# SSH
flyctl ssh console
```

### Docker
```bash
# Build da imagem
docker build -t techfinance-api .

# Executar container
docker run -p 3000:3000 techfinance-api
```

## Variáveis de Ambiente

```env
# Servidor
PORT=3000

# Autenticação
AUTHORIZATION=seu_token_secreto

# Banco de dados
DATABASE_URL=postgresql://...

# OpenAI (se aplicável)
OPENAI_API_KEY=sk-...
```

## Performance

### Otimizações Implementadas
- Cache em múltiplas camadas
- Paginação eficiente
- Índices otimizados no banco
- Logs estruturados
- Timeout configurável

### Monitoramento
- Logs centralizados
- Métricas de performance
- Health checks

## Boas Práticas

### Código
- Use TypeScript strict mode
- Implemente testes para novos endpoints
- Siga o padrão de arquitetura existente
- Use o sistema de logs
- Trate erros adequadamente

### Segurança
- Sempre valide inputs
- Use autenticação em todos os endpoints
- Não exponha informações sensíveis em logs
- Mantenha dependências atualizadas

### Performance
- Use paginação em listas grandes
- Implemente cache quando apropriado
- Otimize consultas ao banco
- Monitor uso de memória

## Troubleshooting

### Problemas Comuns

**Erro de conexão com banco:**
- Verifique DATABASE_URL
- Confirme se o banco está acessível
- Execute as migrações

**Erro 401 Unauthorized:**
- Verifique o token de autorização
- Confirme a variável AUTHORIZATION

**Timeout em consultas:**
- Analise performance das queries
- Verifique índices do banco
- Considere implementar cache

**Erro de dependências:**
```bash
# Limpar cache
bun cache clear

# Reinstalar dependências
rm -rf node_modules bun.lockb
bun install
```

## Contribuição

1. Fork do repositório
2. Crie uma branch para sua feature
3. Implemente testes
4. Execute os testes existentes
5. Submeta um Pull Request

### Convenções de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `test:` Testes
- `refactor:` Refatoração
- `chore:` Tarefas de manutenção
