import logger from "../config/logger";
import { db } from "../db";
import type { Venda } from "../db/schema";

export class SalesRepository {
    async getSales(limite: number, offset: number): Promise<Venda[]> {
        const result = await db`SELECT * FROM fatec_vendas LIMIT ${limite} OFFSET ${offset}`;
        return result as Venda[];
    }

    async getTopProductsByQuantity(limite: number) {
        const result = await db`
            with
            TOP_QUANTITY as (
                select
                codigo_produto,
                descricao_produto,
                sum(cast(replace(replace(qtde, '.', ''), ',', '.') as numeric)) as quantidade_total
                from fatec_vendas
                group by codigo_produto, descricao_produto
                order by quantidade_total desc
            ),
            OBTER_TOTAL as (
                select sum(t.quantidade_total) as total from TOP_QUANTITY t order by total desc
            )
            select codigo_produto, descricao_produto, quantidade_total,
                (select total from OBTER_TOTAL),
                (select COUNT(1) as qtde FROM fatec_vendas)
            from TOP_QUANTITY
            LIMIT ${limite}
        `;
        return result;
    }

    async getTopProductsByValue(limite: number) {
        const result = await db`
            with TOP_QUANTITY as (
                select codigo_produto, descricao_produto,
                    sum(cast(replace(replace(total, '.', ''), ',', '.') as numeric)) as valor_total
                from fatec_vendas
                group by codigo_produto, descricao_produto
                order by valor_total desc
            ),
            OBTER_TOTAL as (
                select sum(t.valor_total) as total from TOP_QUANTITY t order by total desc
            )
            select codigo_produto, descricao_produto, valor_total,
                (select total as total_historico from OBTER_TOTAL),
                (select COUNT(1) as qtde FROM fatec_vendas)
            from TOP_QUANTITY
            LIMIT ${limite}
        `;
        return result;
    }

    async getPriceVariationByProduct(limite: number) {
        const result = await db`
            SELECT codigo_produto, descricao_produto,
                MIN(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC)) AS valor_minimo,
                MAX(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC)) AS valor_maximo,
                ROUND(((MAX(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC)) /
                        MIN(CAST(REPLACE(REPLACE(valor_unitario, '.', ''), ',', '.') AS NUMERIC))) - 1) * 100, 4) AS percentual_diferenca
            FROM fatec_vendas
            GROUP BY codigo_produto, descricao_produto
            ORDER BY percentual_diferenca DESC
            LIMIT ${limite}
        `;
        return result;
    }

    async getCompanySalesParticipation(limite: number) {
        try {
            const totalResult = await db`SELECT SUM(CAST(REPLACE(REPLACE(qtde, '.', ''), ',', '.') AS NUMERIC)) AS total_geral FROM fatec_vendas`;
            if (!totalResult || totalResult.length === 0) {
                console.warn("No sales data found for participation calculation");
                return [];
            }
            const totalGeral = Number(totalResult[0]?.total_geral) || 1;

            if (totalGeral === 0) {
                logger.warn("Total sales quantity is zero, cannot calculate participation");
                return [];
            }

            logger.warn(totalGeral);

            const result = await db`
                SELECT nome_fantasia,
                    SUM(CAST(REPLACE(REPLACE(qtde, '.', ''), ',', '.') AS NUMERIC)) AS quantidade_total,
                    ROUND((SUM(CAST(REPLACE(REPLACE(qtde, '.', ''), ',', '.') AS NUMERIC)) / ${totalGeral}) * 100, 2) AS percentual
                FROM fatec_vendas
                GROUP BY nome_fantasia
                ORDER BY quantidade_total DESC
                LIMIT ${limite}
            `;
            return result;
        } catch (err: any) {
            logger.error('Error in getCompanySalesParticipation: ' + err.message);
            throw new Error(`Failed to get company sales participation: ${err.message || err}`);
        }
    }

    async getCompanySalesParticipationByValue(limite: number) {
        try {
            const totalResult = await db`SELECT SUM(CAST(REPLACE(REPLACE(total, '.', ''), ',', '.') AS NUMERIC)) AS total_geral FROM fatec_vendas`;
            if (!totalResult || totalResult.length === 0) {
                console.warn("No sales data found for value participation calculation");
                return [];
            }
            const totalGeral = Number(totalResult[0]?.total_geral) || 1;

            if (totalGeral === 0) {
                logger.warn("Total sales quantity is zero, cannot calculate participation");
                return [];
            }

            logger.warn(totalGeral)

            const result = await db`
                SELECT nome_fantasia,
                    SUM(CAST(REPLACE(REPLACE(total, '.', ''), ',', '.') AS NUMERIC)) AS valor_total,
                    CAST(ROUND(CAST((SUM(CAST(REPLACE(REPLACE(total, '.', ''), ',', '.') AS NUMERIC)) / ${totalGeral}) * 100 AS NUMERIC), 2) AS NUMERIC) AS percentual
                FROM fatec_vendas
                GROUP BY nome_fantasia
                ORDER BY valor_total DESC
                LIMIT ${limite}
            `;
            return result;
        } catch (err: any) {
            logger.error('Error in getCompanySalesParticipationByValue:' + err.message);
            throw new Error(`Failed to get company sales participation by value: ${err.message || err}`);
        }
    }
}
