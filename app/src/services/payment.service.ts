import type { PaymentRepository } from "../repositories/payment.repository";
import type { PromptService } from "./prompt/prompt.service";

export class PaymentService {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly promptService: PromptService
    ) { }

    async summaryAI(query: Record<string, string | undefined>): Promise<string> {
        const { prompt } = query;

        if (!prompt) {
            throw new Error('Please provide a valid prompt before generating a summary');
        }

        const result = await this.paymentRepository.getSummaryAIData();
        const serializedPaymentResult = JSON.stringify(result);
        const promptMessage = `Data de Hoje = ${new Date().toISOString()}\n\n${prompt}:\n\n${serializedPaymentResult}.\n\n`;
        const response = await this.promptService.generateResponse(promptMessage);

        return response;
    }

    async summary() {
        const result = await this.paymentRepository.getSummaryData();
        return result.rows[0];
    }
}
