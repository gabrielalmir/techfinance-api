import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { env } from "../config/env";

export class GeminiService {
    private model: GenerativeModel;

    constructor() {
        if (!env.GEMINI_KEY) {
            throw new Error('GEMINI_KEY is required to use the Gemini service');
        }

        const genAI = new GoogleGenerativeAI(env.GEMINI_KEY);
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async generateResponse(prompt: string): Promise<string> {
        const chat = this.model.startChat();
        const chatResult = await chat.sendMessage(prompt);
        const response = chatResult.response;
        return response.text();
    }
}
