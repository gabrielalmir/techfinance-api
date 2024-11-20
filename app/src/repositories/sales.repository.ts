import { db } from "../db";
import { vendas } from "../db/schema";

export class SalesRepository {
    async getSales(limite: number, offset: number) {
        return await db.select()
            .from(vendas)
            .limit(limite)
            .offset(offset)
            .execute();
    }

    async getTopProductsByQuantity(limite: number) {
        const sql = `
            with
            TOP_QUANTITY as (
                select
                codigo_produto,
                descricao_produto,
                sum(
                    cast(
                    replace(replace(qtde, '.', ''), ',', '.') as numeric
                    )
                ) as quantidade_total
                from
                fatec_vendas
                group by
                codigo_produto,
                descricao_produto
                order by
                quantidade_total desc
            ),
            OBTER_TOTAL as (
                select
                sum(t.quantidade_total) as total
                from
                TOP_QUANTITY t
                order by
                total desc
            )
            select
            codigo_produto,
            descricao_produto,
            quantidade_total,
            (
                select
                total
                from
                OBTER_TOTAL
            ),
            (
                select COUNT(1) as qtde
                FROM fatec_vendas
            )
            from
            TOP_QUANTITY
            LIMIT ${limite};
        `;

        const result = await db.execute(sql);
        return result.rows;
    }

    async getTopProductsByValue(limite: number) {
        const sql = `
            SELECT
                codigo_produto,
                descricao_produto,
                SUM(CAST(REPLACE(REPLACE(total, '.', ''), ',', '.') AS NUMERIC)) AS valor_total
            FROM fatec_vendas
            GROUP BY codigo_produto, descricao_produto
            ORDER BY valor_total DESC
            LIMIT ${limite}
        `;

        const result = await db.execute(sql);
        return result.rows;
    }

    async getPriceVariationByProduct(limite: number) {
        const sql = `
            SELECT
                codigo_produto,
                descricao_produto,
                MIN(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC)) AS valor_minimo,
                MAX(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC)) AS valor_maximo,
                ROUND(((MAX(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC)) /
                        MIN(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC))) - 1) * 100, 4) AS percentual_diferenca
            FROM fatec_vendas
            GROUP BY codigo_produto, descricao_produto
            ORDER BY percentual_diferenca DESC
            LIMIT ${limite}
        `;

        const result = await db.execute(sql);
        return result.rows;
    }

    async getCompanySalesParticipation(limite: number) {
        const totalSql = `
            SELECT
                SUM(CAST(REPLACE(REPLACE(qtde, '.', ''), ',', '.') AS NUMERIC)) AS total_geral
            FROM fatec_vendas
        `;

        const totalResult = await db.execute(totalSql);

        if (totalResult.rows.length == 0) {
            throw new Error("No sales data found.");
        }

        const totalGeral = totalResult.rows[0]?.total_geral || 1;

        const sql = `
            SELECT
                nome_fantasia,
                SUM(CAST(REPLACE(REPLACE(qtde, '.', ''), ',', '.') AS NUMERIC)) AS quantidade_total,
                ROUND((SUM(CAST(REPLACE(REPLACE(qtde, '.', ''), ',', '.') AS NUMERIC)) / ${totalGeral}) * 100, 2) AS percentual
            FROM fatec_vendas
            GROUP BY nome_fantasia
            ORDER BY quantidade_total DESC
            LIMIT ${limite}
        `;

        const result = await db.execute(sql);
        return result.rows;
    }
}
