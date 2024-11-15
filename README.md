# TechFinance

TechFinance é uma solução mobile para prover informações para apoio na tomada de decisões. Esta é uma API backend construída utilizando o framework **Elysia** (na linguagem TypeScript) e executada com **Bun.js**.

## Funcionalidades

- Buscar detalhes de produtos com base em consultas (descrição e grupo).
- Buscar detalhes de clientes com base em consultas (nome e grupo).
- Suporte à paginação (limite e offset são usados para produtos e clientes).
- Utiliza uma conexão com banco de dados para executar consultas SQL dinamicamente.

## Dependências

- [Elysia](https://elysia.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Bun.js](https://bun.sh/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zod](https://zod.dev/)

## Endpoints

### Buscar Produtos

**Endpoint:** `/products`

**Método:** `GET`

Recupera uma lista de produtos com base nos parâmetros de consulta:

- `descricao`: Filtro para a descrição do produto.
- `grupo`: Filtro para o grupo do produto.
- `limite`: Limita o número de produtos retornados (padrão é 10).
- `pagina`: Especifica a página de resultados (padrão é 1).

Exemplo de uso:

```
GET /products?descricao=celular&grupo=eletronicos&limite=10&pagina=1
```

### Buscar Clientes

**Endpoint:** `/customers`

**Método:** `GET`

Recupera uma lista de clientes com base nos parâmetros de consulta:

- `nome`: Filtro para o nome do cliente.
- `grupo`: Filtro para o grupo do cliente.
- `limite`: Limita o número de clientes retornados (padrão é 10).
- `pagina`: Especifica a página de resultados (padrão é 1).

Exemplo de uso:

```
GET /customers?nome=joao&grupo=varejo&limite=10&pagina=2
```

### Resumo de Contas a Receber

**Endpoint:** `/resumo_contas_receber`

**Método:** `GET`

Recupera um resumo das contas a receber, categorizando-as por status de vencimento.

## Consultas ao Banco de Dados

Produtos e clientes são recuperados do banco de dados utilizando consultas SQL dinâmicas:

- Os produtos são selecionados na tabela `fatec_produtos`.
- Os clientes são selecionados na tabela `fatec_clientes`.

As consultas incluem filtros de busca usando operadores `LIKE` e suporte à paginação usando `LIMIT` e `OFFSET`.

## Como Executar

1. Instale Bun.js e Elysia.
2. Configure o banco de dados e a conexão no pacote `config`.
3. Execute a aplicação:

```bash
bun run main.ts
```

## Configuração do Docker

O projeto inclui um arquivo `docker-compose.yml` para facilitar a configuração e execução dos serviços necessários (nginx, postgres e a aplicação).

## Variáveis de Ambiente

As variáveis de ambiente são configuradas no arquivo `.env`:

```
DATABASE_URL=postgresql://docker:docker@db:6543/docker
AUTHORIZATION=ronaldo
```

## Documentação Swagger

A documentação da API pode ser acessada em `/docs` quando a aplicação estiver em execução.
