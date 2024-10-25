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
