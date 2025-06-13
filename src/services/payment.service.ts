import type { PaymentRepository } from "../repositories/payment.repository";
import type { PromptService } from "./prompt/prompt.service";

export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly promptService: PromptService
    ) { }

    async summaryAI(query: Record<string, string | undefined>): Promise<any> {
        const { prompt } = query;

        if (!prompt) {
            throw new Error('Please provide a valid prompt before generating a summary');
        }

        const result = await this.paymentRepository.getSummaryAIData();
        const serializedPaymentResult = JSON.stringify(result);
        const promptMessage = `Data de Hoje = ${new Date().toISOString()}\n\n${prompt}:\n\n${serializedPaymentResult}.\n\n`;
        const response = await this.promptService.generateResponse(promptMessage);

        // Tenta fazer parse do JSON, mas retorna a resposta original se falhar
        try {
            return JSON.parse(response);
        } catch (parseError) {
            console.warn('Falha ao fazer parse do JSON da resposta da IA:', parseError);
            // Se a resposta já for um objeto, retorna como está
            if (typeof response === 'object') {
                return response;
            }
            // Se for string que não conseguiu fazer parse, tenta retornar um objeto estruturado
            return {
                renegotiated_titles: [],
                cash_flow_summary: [],
                notes: response || 'Erro ao processar resposta da IA'
            };
        }
    }

    async summary() {
        try {
            const result = await this.paymentRepository.getSummaryData();
            console.log('Summary data result:', result);

            if (!result || !result.rows || result.rows.length === 0) {
                console.warn('No summary data found, returning empty structure');
                return {
                    outro: 0,
                    atraso_30_60: 0,
                    atraso_ate_30: 0,
                    vence_ate_30: 0,
                    vencimento_superior_30: 0,
                    vencimento_hoje: 0
                };
            }

            return result.rows[0];
        } catch (error) {
            console.error('Error in summary service:', error);
            throw new Error(`Failed to get payment summary: ${error}`);
        }
    }
}
