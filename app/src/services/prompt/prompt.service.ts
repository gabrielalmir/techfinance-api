export interface PromptService {
    generateResponse(prompt: string): Promise<string>
}
