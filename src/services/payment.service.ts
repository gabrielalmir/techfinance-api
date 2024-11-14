import { sql } from "drizzle-orm";
import { db } from "../db";
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { env } from "../config/env";

export enum WhoEnum {
    me = 'me',
    bot = 'bot',
}

export interface MessageModel {
    message: string;
    who: WhoEnum;
}

export class PaymentService {
    private model: GenerativeModel;
    public messages: MessageModel[] = [];

    constructor() {
        const genAI = new GoogleGenerativeAI(env.GEMINI_KEY);
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async summaryAI(query: Record<string, string | undefined>): Promise<any> {
        const result = await db.execute(sql`
            select documento, titulo, parcela, nome_fantasia, valor_saldo, data_vencimento 
            from fatec_contas_receber where data_vencimento < '2024-03-31'
        `)

        const { prompt: message } = query;
        
        const resultJson = JSON.stringify(result)
        const prompt = `${message}:\n\nEscreva sempre em Português do Brasil e considere a data de hoje como ${new Date().toISOString()}. Formate datas e moedas no padrão brasileiro\n\n${resultJson}`;

        const chat = this.model.startChat();
        const chatResult = await chat.sendMessage(prompt);
        const response = chatResult.response;
        const text = response.text();

        return text;
    }

    async summary() {
        const result = await db.execute(sql`
            WITH CONTAS AS (
                SELECT
                    CAST(data_vencimento AS DATE) - CURRENT_DATE AS dif_data,
                    CASE
                        WHEN CAST(data_vencimento AS DATE) - CURRENT_DATE = 0 THEN 'Vencimento hoje'
                        WHEN CAST(data_vencimento AS DATE) - CURRENT_DATE > 0 AND CAST(data_vencimento AS DATE) - CURRENT_DATE < 31 THEN 'Vence em até 30 dias'
                        WHEN CAST(data_vencimento AS DATE) - CURRENT_DATE < 0 AND CAST(data_vencimento AS DATE) - CURRENT_DATE >= -30 THEN 'Atraso de até 30 dias'
                        WHEN CAST(data_vencimento AS DATE) - CURRENT_DATE < -30 AND CAST(data_vencimento AS DATE) - CURRENT_DATE >= -60 THEN 'Atraso de 30 a 60 dias'
                        WHEN CAST(data_vencimento AS DATE) - CURRENT_DATE > 30 THEN 'Vencimento superior a 30 dias'
                        ELSE 'Vencido há mais de 60 dias'
                    END AS status_vencimento
                FROM fatec_contas_receber
            )

            SELECT
                COUNT(CASE WHEN status_vencimento = 'Vencido há mais de 60 dias' THEN 1 END) AS outro,
                COUNT(CASE WHEN status_vencimento = 'Atraso de 30 a 60 dias' THEN 1 END) AS atraso_30_60,
                COUNT(CASE WHEN status_vencimento = 'Atraso de até 30 dias' THEN 1 END) AS atraso_ate_30,
                COUNT(CASE WHEN status_vencimento = 'Vence em até 30 dias' THEN 1 END) AS vence_ate_30,
                COUNT(CASE WHEN status_vencimento = 'Vencimento superior a 30 dias' THEN 1 END) AS vencimento_superior_30,
                COUNT(CASE WHEN status_vencimento = 'Vencimento hoje' THEN 1 END) AS vencimento_hoje
            FROM CONTAS;
        `)

        return result.rows[0];
    }
}
