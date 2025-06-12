# TechFinance API - Documentação

## Visão Geral

A TechFinance API é uma solução backend construída com **Elysia** (TypeScript) e **Bun.js** que fornece informações para apoio na tomada de decisões empresariais. A API oferece endpoints para consulta de produtos, clientes, vendas e contas a receber.

### Informações da API

- **Versão:** 1.0
- **URL Base (Produção):** https://techfinance-api.fly.dev
- **URL Base (Desenvolvimento):** http://localhost:3000
- **Documentação Interativa:** [URL_BASE]/docs (Swagger UI)

### Autenticação

Todos os endpoints requerem autenticação via Bearer Token:

```
Authorization: Bearer {TOKEN}
```

## Estruturas de Dados

### Product
```typescript
{
  codigo: string;
  descricao_produto: string;
  descricao_grupo: string;
  id_grupo: string;
  id_produto: string;
  nome_produto: string;
}
```

### Customer
```typescript
{
  id_cliente: number;
  razao_cliente: string;
  nome_fantasia: string;
  cidade: string;
  uf: string;
  id_grupo: string;
  descricao_grupo: string;
}
```

### Sales
```typescript
{
  idVenda: number;
  dataEmissao: string;
  tipo: number;
  descricaoTipo: string;
  idCliente: number;
  razaoCliente: string;
  nomeFantasia: string;
  idGrupoCliente: number;
  descricaoGrupoCliente: string;
  cidade: string;
  uf: string;
  codigoProduto: string;
  descricaoProduto: string;
  idGrupoProduto: string;
  descricaoGrupoProduto: string;
  qtde: number;
  valorUnitario: string;
  total: string;
}
```

### ResumoAtraso
```typescript
{
  atraso_30_60: number;
  atraso_ate_30: number;
  outro: number;
  vence_ate_30: number;
  vencimento_hoje: number;
  vencimento_superior_30: number;
  total: number;
}
```

## Endpoints

### Produtos

#### 1. Listar Produtos
**Endpoint:** `GET /produtos`

**Descrição:** Recupera uma lista paginada de produtos com filtros opcionais.

**Parâmetros de Query:**
- `nome` (string, opcional): Filtro para nome/descrição do produto
- `grupo` (string, opcional): Filtro para grupo do produto
- `limite` (number, opcional): Número máximo de produtos retornados (padrão: 10)
- `pagina` (number, opcional): Página de resultados (padrão: 1)

**Exemplo de Requisição:**
```
GET /produtos?nome=celular&grupo=eletronicos&limite=20&pagina=1
```

**Resposta de Sucesso:**
```json
[
  {
    "codigo": "123",
    "descricao_produto": "Smartphone XYZ",
    "descricao_grupo": "Eletrônicos",
    "id_grupo": "1",
    "id_produto": "123",
    "nome_produto": "Smartphone XYZ"
  }
]
```

**Resposta de Erro:**
```json
{
  "status": 500,
  "message": "Erro ao obter produtos"
}
```

#### 2. Produtos Mais Vendidos
**Endpoint:** `GET /produtos/mais-vendidos`

**Descrição:** Retorna os produtos mais vendidos por quantidade.

**Parâmetros de Query:** (opcionais)
- Filtros customizados conforme necessidade

**Resposta de Sucesso:**
```json
[
  {
    "codigo": "123",
    "descricao_produto": "Produto Top",
    "descricao_grupo": "Categoria A",
    "id_grupo": "1",
    "quantidade": 150
  }
]
```

#### 3. Produtos de Maior Valor
**Endpoint:** `GET /produtos/maior-valor`

**Descrição:** Retorna os produtos com maior valor de vendas.

**Resposta de Sucesso:**
```json
[
  {
    "id": 1,
    "name": "Produto Premium",
    "value": 10000.00
  }
]
```

#### 4. Variação de Preço dos Produtos
**Endpoint:** `GET /produtos/variacao-preco`

**Descrição:** Retorna a variação de preços dos produtos ao longo do tempo.

**Resposta de Sucesso:**
```json
[
  {
    "id": 1,
    "name": "Produto Variável",
    "variation": 15.5
  }
]
```

### Clientes

#### 1. Listar Clientes
**Endpoint:** `GET /clientes`

**Descrição:** Recupera uma lista paginada de clientes com filtros opcionais.

**Parâmetros de Query:**
- `nome` (string, opcional): Filtro para nome do cliente
- `grupo` (string, opcional): Filtro para grupo do cliente
- `limite` (number, opcional): Número máximo de clientes retornados (padrão: 10)
- `pagina` (number, opcional): Página de resultados (padrão: 1)

**Exemplo de Requisição:**
```
GET /clientes?nome=joao&grupo=varejo&limite=20&pagina=2
```

**Resposta de Sucesso:**
```json
[
  {
    "id_cliente": 1,
    "razao_cliente": "João Silva LTDA",
    "nome_fantasia": "Silva Comércio",
    "cidade": "São Paulo",
    "uf": "SP",
    "id_grupo": "1",
    "descricao_grupo": "Varejo"
  }
]
```

**Resposta de Erro:**
```json
{
  "status": 500,
  "message": "Erro ao obter clientes"
}
```

### Vendas

#### 1. Listar Vendas
**Endpoint:** `GET /vendas`

**Descrição:** Recupera uma lista de vendas com filtros opcionais.

**Parâmetros de Query:** (opcionais)
- Filtros customizados conforme necessidade

**Resposta de Sucesso:**
```json
[
  {
    "idVenda": 1,
    "dataEmissao": "2024-01-15",
    "tipo": 1,
    "descricaoTipo": "Venda Normal",
    "idCliente": 123,
    "razaoCliente": "Cliente ABC",
    "nomeFantasia": "ABC Comércio",
    "idGrupoCliente": 1,
    "descricaoGrupoCliente": "Varejo",
    "cidade": "São Paulo",
    "uf": "SP",
    "codigoProduto": "P001",
    "descricaoProduto": "Produto A",
    "idGrupoProduto": "1",
    "descricaoGrupoProduto": "Categoria A",
    "qtde": 10,
    "valorUnitario": "50.00",
    "total": "500.00"
  }
]
```

#### 2. Participação de Empresas
**Endpoint:** `GET /empresas/participacao`

**Descrição:** Retorna a participação de empresas nas vendas.

**Resposta de Sucesso:**
```json
[
  {
    "empresa": "Empresa A",
    "participacao": 35.5,
    "total_vendas": 1000000
  }
]
```

#### 3. Participação de Empresas por Valor
**Endpoint:** `GET /empresas/participacao-por-valor`

**Descrição:** Retorna a participação de empresas nas vendas por valor monetário.

**Resposta de Sucesso:**
```json
[
  {
    "empresa": "Empresa B",
    "participacao_valor": 42.3,
    "valor_total": 2500000
  }
]
```

### Contas a Receber

#### 1. Resumo de Contas a Receber
**Endpoint:** `GET /contas_receber/resumo`

**Descrição:** Retorna um resumo das contas a receber organizadas por períodos de vencimento.

**Resposta de Sucesso:**
```json
{
  "atraso_30_60": 15000.00,
  "atraso_ate_30": 8500.00,
  "outro": 2300.00,
  "vence_ate_30": 45000.00,
  "vencimento_hoje": 12000.00,
  "vencimento_superior_30": 38000.00,
  "total": 120800.00
}
```

#### 2. Resumo AI de Contas a Receber
**Endpoint:** `GET /contas_receber/ai`

**Descrição:** Utiliza IA para gerar análises e sugestões sobre contas a receber.

**Parâmetros de Query:**
- `prompt` (string, opcional): Prompt personalizado para a IA

**Exemplo de Requisição:**
```
GET /contas_receber/ai?prompt=Analise os títulos em atraso e sugira renegociações
```

**Resposta de Sucesso:**
```json
{
  "renegotiated_titles": [
    {
      "title": "T001",
      "value": "5000.00",
      "renegotiation_date": "2024-06-15",
      "original_due_date": "2024-05-01",
      "new_due_date": "2024-07-15"
    }
  ],
  "cash_flow_summary": [
    {
      "month_year": "2024-07",
      "total_renegotiated": "15000.00"
    }
  ],
  "notes": "Recomenda-se priorizar a renegociação dos títulos com atraso superior a 60 dias."
}
```

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **401 Unauthorized**: Token de autenticação inválido ou ausente
- **500 Internal Server Error**: Erro interno do servidor

## Paginação

Os endpoints que suportam paginação utilizam os seguintes parâmetros:
- `limite`: Número de itens por página (padrão: 10)
- `pagina`: Número da página (começando em 1)

O offset é calculado automaticamente: `offset = (pagina - 1) * limite`

## Filtros

Os filtros são aplicados usando operadores `LIKE` no banco de dados, permitindo busca parcial por texto.

## Tratamento de Erros

Todos os endpoints retornam erros em formato JSON com a estrutura:
```json
{
  "status": <código_http>,
  "message": "<mensagem_descritiva>"
}
```

## Logs

A API utiliza um sistema de logs estruturados que registra:
- Início e fim das operações
- Parâmetros de entrada
- Erros e exceções
- Métricas de performance

## Rate Limiting

Atualmente não há limitação de taxa implementada, mas recomenda-se uso responsável da API.

## Versionamento

A API está na versão 1.0. Futuras mudanças de versão serão comunicadas através da documentação.

## Suporte

Para dúvidas ou problemas técnicos, consulte os logs da aplicação ou entre em contato com a equipe de desenvolvimento.
