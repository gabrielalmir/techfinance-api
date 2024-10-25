
# TechFinance

TechFinance é uma solução mobile para para prover informações para apoio para tomada de decisões. Esta é uma API backend construída utilizando o framework **Fiber** (na linguagem Go).

## Funcionalidades

- Buscar detalhes de produtos com base em consultas (descrição e grupo).
- Buscar detalhes de clientes com base em consultas (nome e grupo).
- Suporte à paginação (limite e offset são usados para produtos e clientes).
- Utiliza uma conexão com banco de dados para executar consultas SQL dinamicamente.

## Dependências

- [Fiber](https://gofiber.io/)
- [Go](https://golang.org/)
- [Manipulação de Conexão com Banco de Dados (pacotes config e db)](./internal/db)
- Modelos Customizados (`internal/models`)

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

## Tratamento de Erros

Em caso de erros (como falhas na conexão com o banco de dados), a API retornará:

- Status: `500 Internal Server Error`
- Resposta JSON:
  ```json
  {
    "message": "Mensagem de erro",
    "error": "Descrição detalhada do erro"
  }
  ```

## Consultas ao Banco de Dados

Produtos e clientes são recuperados do banco de dados utilizando consultas SQL dinâmicas:

- Os produtos são selecionados na tabela `fatec_produtos`.
- Os clientes são selecionados na tabela `fatec_clientes`.

As consultas incluem filtros de busca usando operadores `LIKE` e suporte à paginação usando `LIMIT` e `OFFSET`.

## Como Executar

1. Instale Go e Fiber.
2. Configure o banco de dados e a conexão no pacote `config`.
3. Execute a aplicação:

```bash
go run main.go
```
