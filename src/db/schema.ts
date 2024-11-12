import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const produtos = pgTable("fatec_produtos", {
    codigo: text().primaryKey().notNull(),
    descricao_produto: text().notNull(),
    descricao_grupo: text().notNull(),
    id_grupo: text().notNull(),
});

export const clientes = pgTable("fatec_clientes", {
    id_cliente: integer().primaryKey().notNull(),
    razao_cliente: text().notNull(),
    nome_fantasia: text().notNull(),
    cidade: text().notNull(),
    uf: text().notNull(),
    id_grupo: text().notNull(),
    descricao_grupo: text().notNull(),
})

export const contas_receber = pgTable("fatec_contas_receber", {
    idcr: integer('idcr').primaryKey(),
    documento: text('documento'),
    titulo: integer('titulo'),
    parcela: integer('parcela'),
    id_cliente: integer('id_cliente'),
    razao_cliente: text('razao_cliente'),
    nome_fantasi: text('nome_fantasi'),
    id_grupo_clie: integer('id_grupo_clie'),
    descricao_gru: text('descricao_gru'),
    cidade: text('cidade'),
    uf: text('uf'),
    valor_titulo: text('valor_titulo'),
    valor_recebid: text('valor_recebid'),
    valor_saldo: text('valor_saldo'),
    data_emissao: text('data_emissao'),
    data_entrada: text('data_entrada'),
    data_vencimento: text('data_vencimento'),
})
