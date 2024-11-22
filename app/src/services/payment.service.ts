import type { PaymentRepository } from "../repositories/payment.repository";
import { GeminiService } from "./gemini.service";

export class PaymentService {
    private geminiService: GeminiService;

    constructor(private readonly paymentRepository: PaymentRepository) {
        this.geminiService = new GeminiService();
    }

    async summaryAI(query: Record<string, string | undefined>): Promise<any> {
        const result = await this.paymentRepository.getSummaryAIData();

        const { prompt: message } = query;
        const resultJson = JSON.stringify(result);

        const prompt = `${message}:\n\nEscreva sempre em Português do Brasil e considere a data de hoje como ${new Date().toISOString()}. Formate datas e moedas no padrão brasileiro\n\n${resultJson}. Considere por data de vencimento ordenada da mais antiga para mais nova.`;
        const response = await this.geminiService.generateResponse(prompt);

        return response;
    }

    async summary() {
        const result = await this.paymentRepository.getSummaryData();
        return result.rows[0];
    }
}
