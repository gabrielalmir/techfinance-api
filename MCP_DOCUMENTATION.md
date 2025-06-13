# TechFinance MCP Server - Documentação

## Visão Geral

O TechFinance MCP Server implementa o Model Context Protocol (MCP) para fornecer uma interface padronizada para análises financeiras e de negócios. Este servidor permite que clients externos interajam com os dados e ferramentas do TechFinance de forma estruturada e consistente.

## Funcionalidades

### 🔧 Ferramentas Disponíveis

#### 1. `analyze_financial_data`
Analisa dados financeiros e gera insights detalhados.

**Parâmetros:**
```json
{
  "data": [/* array de dados financeiros */],
  "analysisType": "cash_flow" | "receivables" | "sales"
}
```

**Exemplo de Uso:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "call_tool",
  "params": {
    "name": "analyze_financial_data",
    "arguments": {
      "data": [
        { "amount": 5000, "due_date": "2024-12-01", "status": "overdue" },
        { "amount": 3000, "due_date": "2024-12-15", "status": "pending" }
      ],
      "analysisType": "receivables"
    }
  }
}
```

#### 2. `generate_report`
Gera relatórios customizados em diferentes formatos.

**Parâmetros:**
```json
{
  "reportType": "customers" | "sales" | "receivables" | "financial_summary",
  "format": "json" | "csv" | "pdf",
  "filters": { /* filtros opcionais */ }
}
```

### 📝 Prompts Disponíveis

#### 1. `renegotiation_analysis`
Template para análise de renegociação de títulos.

**Variáveis:**
- `titles_data`: Dados dos títulos vencidos
- `criteria`: Critérios de renegociação
- `base_date`: Data base para análise

#### 2. `customer_analysis`
Template para análise de perfil de clientes.

**Variáveis:**
- `customer_data`: Dados do cliente
- `sales_history`: Histórico de vendas
- `payment_history`: Histórico de pagamentos

### 🗂️ Contextos

Os contextos MCP permitem manter estado entre interações, armazenando dados temporários e metadados relacionados a análises específicas.

**Estrutura de um Contexto:**
```typescript
{
  id: string;
  name: string;
  description: string;
  data: {
    customerId?: number;
    salesData?: any[];
    receivablesData?: any[];
    period?: { start: string; end: string };
    analysisType?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Endpoints da API

### Comunicação MCP (JSON-RPC)

#### `POST /mcp`
Endpoint principal para comunicação via JSON-RPC 2.0.

**Exemplo de Inicialização:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true }
    },
    "clientInfo": {
      "name": "TechFinance Client",
      "version": "1.0.0"
    }
  }
}
```

### Endpoints REST (Conveniência)

#### Contextos
- `GET /mcp/contexts` - Listar todos os contextos
- `POST /mcp/contexts` - Criar novo contexto
- `GET /mcp/contexts/:id` - Obter contexto específico
- `PUT /mcp/contexts/:id` - Atualizar contexto
- `DELETE /mcp/contexts/:id` - Remover contexto

#### Ferramentas
- `GET /mcp/tools` - Listar ferramentas disponíveis
- `POST /mcp/tools/:name/execute` - Executar ferramenta específica

#### Prompts
- `GET /mcp/prompts` - Listar prompts disponíveis
- `GET /mcp/prompts/:name` - Obter prompt compilado com variáveis

#### Recursos
- `GET /mcp/resources` - Listar recursos disponíveis
- `GET /mcp/resources/:uri` - Obter recurso específico

## Exemplos de Uso

### 1. Análise de Fluxo de Caixa

```bash
curl -X POST http://localhost:3000/mcp/tools/analyze_financial_data/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ronaldo" \
  -d '{
    "data": [
      { "inflow": 10000, "outflow": 8000, "date": "2024-12-01" },
      { "inflow": 12000, "outflow": 9000, "date": "2024-12-02" }
    ],
    "analysisType": "cash_flow"
  }'
```

### 2. Criação de Contexto para Análise

```bash
curl -X POST http://localhost:3000/mcp/contexts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ronaldo" \
  -d '{
    "name": "Análise Cliente ABC",
    "description": "Contexto para análise do cliente ABC Corp",
    "data": {
      "customerId": 123,
      "analysisType": "customer",
      "period": {
        "start": "2024-01-01",
        "end": "2024-12-31"
      }
    }
  }'
```

### 3. Geração de Prompt para Renegociação

```bash
curl -X GET "http://localhost:3000/mcp/prompts/renegotiation_analysis?titles_data=titulo1,titulo2&criteria=20dias&base_date=2024-12-12" \
  -H "Authorization: Bearer ronaldo"
```

## Códigos de Erro

| Código | Nome | Descrição |
|--------|------|-----------|
| -32700 | PARSE_ERROR | Erro de parsing JSON |
| -32600 | INVALID_REQUEST | Requisição inválida |
| -32601 | METHOD_NOT_FOUND | Método não encontrado |
| -32602 | INVALID_PARAMS | Parâmetros inválidos |
| -32603 | INTERNAL_ERROR | Erro interno do servidor |
| -32001 | RESOURCE_NOT_FOUND | Recurso não encontrado |
| -32002 | TOOL_NOT_FOUND | Ferramenta não encontrada |
| -32003 | PROMPT_NOT_FOUND | Prompt não encontrado |
| -32004 | CONTEXT_NOT_FOUND | Contexto não encontrado |
| -32005 | UNAUTHORIZED | Não autorizado |

## Capacidades do Servidor

O servidor MCP do TechFinance suporta:

- ✅ **Ferramentas** - Análises financeiras e geração de relatórios
- ✅ **Prompts** - Templates para análises específicas
- ✅ **Recursos** - Acesso a dados estruturados
- ✅ **Contextos** - Gerenciamento de estado entre interações
- ✅ **Logging** - Rastreamento de operações
- ✅ **Notificações** - Atualizações de lista de recursos/ferramentas

## Autenticação

Todos os endpoints requerem autenticação via Bearer token:

```
Authorization: Bearer ronaldo
```

## Versionamento

- **Versão do Protocolo MCP**: 2024-11-05
- **Versão do Servidor**: 1.0.0
- **Compatibilidade**: MCP v1.0+

## Integração com Outras Ferramentas

O servidor MCP pode ser integrado com:

- **Claude Desktop** - Para análises via interface gráfica
- **VS Code Extensions** - Para análises durante desenvolvimento
- **Scripts Python/Node.js** - Para automações
- **Jupyter Notebooks** - Para análises exploratórias
- **Business Intelligence Tools** - Para dashboards

## Monitoramento e Logs

Todas as operações são registradas com diferentes níveis:

- `INFO` - Operações normais
- `WARN` - Situações de atenção
- `ERROR` - Erros que requerem investigação

Logs incluem contexto relevante como IDs de contexto, nomes de ferramentas e parâmetros utilizados.

## Considerações de Performance

- Contextos são mantidos em memória (considere persistência para produção)
- Ferramentas de análise podem ser intensivas para grandes datasets
- Implementar cache para consultas frequentes
- Monitorar uso de memória para contextos de longa duração

## Roadmap

### Próximas Funcionalidades

- [ ] Persistência de contextos em banco de dados
- [ ] Cache inteligente para análises recorrentes
- [ ] Integração com webhooks para notificações
- [ ] Suporte a streaming para análises longas
- [ ] Dashboard web para monitoramento MCP
- [ ] Autenticação mais robusta (JWT, OAuth)
- [ ] Rate limiting por client
- [ ] Métricas de uso e performance
