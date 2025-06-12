
# TechFinance API

TechFinance é uma solução mobile para prover informações para apoio na tomada de decisões. Esta é uma API backend construída utilizando o framework **Elysia** (na linguagem TypeScript) e executada com **Bun.js**.

## 📖 Documentação

- **[📋 Documentação da API](./API_DOCUMENTATION.md)** - Guia completo dos endpoints, parâmetros e respostas
- **[👨‍💻 Guia do Desenvolvedor](./DEVELOPER_GUIDE.md)** - Instruções para desenvolvimento, testes e deploy
- **[🔗 Swagger UI](https://techfinance-api.fly.dev/docs)** - Documentação interativa (produção)

## 🚀 Início Rápido

```bash
# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações
bun run db:migrate

# Iniciar servidor de desenvolvimento
bun run dev
```

## 🛠 Funcionalidades

- ✅ Buscar produtos com filtros e paginação
- ✅ Buscar clientes com filtros e paginação
- ✅ Consultar vendas e relatórios de performance
- ✅ Resumo de contas a receber com análise por IA
- ✅ Participação de empresas nas vendas
- ✅ Produtos mais vendidos e de maior valor
- ✅ Variação de preços de produtos
- ✅ Autenticação via Bearer Token
- ✅ Documentação automática (Swagger)
- ✅ Logs estruturados
- ✅ Tratamento robusto de erros

## 🏗 Tecnologias

- **[Elysia](https://elysia.js.org/)** - Framework web moderno para Bun
- **[Bun.js](https://bun.sh/)** - Runtime JavaScript ultra-rápido
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Drizzle ORM](https://orm.drizzle.team/)** - ORM type-safe
- **[Vitest](https://vitest.dev/)** - Framework de testes
- **[Swagger](https://swagger.io/)** - Documentação da API

## 📌 Principais Endpoints

### Produtos
- `GET /produtos` - Lista produtos com filtros e paginação
- `GET /produtos/mais-vendidos` - Produtos mais vendidos por quantidade
- `GET /produtos/maior-valor` - Produtos com maior valor de vendas
- `GET /produtos/variacao-preco` - Variação de preços dos produtos

### Clientes
- `GET /clientes` - Lista clientes com filtros e paginação

### Vendas
- `GET /vendas` - Lista vendas com filtros
- `GET /empresas/participacao` - Participação de empresas nas vendas
- `GET /empresas/participacao-por-valor` - Participação por valor monetário

### Contas a Receber
- `GET /contas_receber/resumo` - Resumo por períodos de vencimento
- `GET /contas_receber/ai` - Análise e sugestões com IA

> 📋 **Documentação completa:** Veja [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para detalhes de todos os endpoints, parâmetros e exemplos de resposta.

## 🗄 Banco de Dados

A API utiliza consultas SQL dinâmicas para recuperar dados:

- **Produtos:** Tabela `fatec_produtos`
- **Clientes:** Tabela `fatec_clientes`
- **Vendas:** Tabela `fatec_vendas`
- **Contas a Receber:** Tabela `fatec_contas_receber`

As consultas incluem:
- Filtros de busca usando operadores `LIKE`
- Paginação com `LIMIT` e `OFFSET`
- Joins otimizados para relatórios complexos

## 🚀 Deploy

### Desenvolvimento
```bash
bun run dev
```

### Produção (Fly.io)
```bash
flyctl deploy
```

### Docker
```bash
docker build -t techfinance-api .
docker run -p 3000:3000 techfinance-api
```

## 🧪 Testes

```bash
# Executar todos os testes
bun test

# Testes em modo watch
bun test --watch

# Testes com coverage
bun test --coverage
```

## 📝 Logs

A aplicação utiliza logs estruturados que registram:
- Início e fim de operações
- Parâmetros de entrada
- Erros e exceções
- Métricas de performance

## 🔒 Autenticação

Todos os endpoints requerem autenticação via Bearer Token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://techfinance-api.fly.dev/produtos
```

## 📊 Monitoramento

- **Health Check:** Automático via Fly.io
- **Logs:** Centralizados e estruturados
- **Métricas:** Performance e uso de recursos
- **Swagger UI:** Documentação sempre atualizada

## 🤝 Contribuição

1. Fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

