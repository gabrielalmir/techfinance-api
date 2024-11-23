import OpenAI from "openai";
import type { PromptService } from "./prompt.service";

export class OpenAIService implements PromptService {
    private readonly openai: OpenAI;

    constructor() {
        this.openai = new OpenAI();
    }

    async generateResponse(prompt: string): Promise<string> {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { "role": "user", "content": prompt }
            ],
        });

        const messages = [];
        for (const c of completion.choices) {
            if (c.message.content) {
                messages.push(c.message.content);
            }
        }

        return messages.join('');
    }
}
