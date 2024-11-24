import type { PaymentRepository } from "../repositories/payment.repository";
import type { PromptService } from "./prompt/prompt.service";

export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly promptService: PromptService
    ) { }

    async summaryAI(query: Record<string, string | undefined>): Promise<string> {
        const { quantidade } = query;

        const prompt = `
            Realize a renegociação de todos os títulos vencidos, considere a renegociação de ${quantidade} título por dia, somente os títulos vencidos e o inicio da renegociação a data de hoje. Considerar que a nova data de vencimento será de 20 dias a contar da data de cada renegociação. Crie uma tabela e projete um fluxo de caixa com base nas novas datas de recebimento, exibir as seguintes colunas: título, valor, dt de renegociação, dt original vencto, nova dt vencto. Exiba também o novo fluxo de caixa resumido por mês.
        `;

        if (!prompt) {
            throw new Error('Please provide a valid prompt before generating a summary');
        }

        const result = await this.paymentRepository.getSummaryAIData();
        const serializedPaymentResult = JSON.stringify(result);

        const promptMessage = `Data de Hoje = ${new Date().toISOString()}\n\n${prompt}:\n\n${serializedPaymentResult}. Exibir as datas em dois caracteres (padrão: dd/MM/YY). Até 500 caracteres.\n\n`;
        const response = await this.promptService.generateResponse(promptMessage);

        return response;
    }

    async summary() {
        const result = await this.paymentRepository.getSummaryData();
        return result.rows[0];
    }
}
