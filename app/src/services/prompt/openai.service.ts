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
            response_format: {
                "type": "json_schema",
                "json_schema": {
                    "name": "renegotiation_schema",
                    "strict": true,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "renegotiated_titles": {
                                "type": "array",
                                "description": "List of renegotiated titles.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {
                                            "type": "string",
                                            "description": "The identifier of the title."
                                        },
                                        "value": {
                                            "type": "string",
                                            "description": "The value of the title."
                                        },
                                        "renegotiation_date": {
                                            "type": "string",
                                            "description": "The date when the title was renegotiated."
                                        },
                                        "original_due_date": {
                                            "type": "string",
                                            "description": "The original due date of the title."
                                        },
                                        "new_due_date": {
                                            "type": "string",
                                            "description": "The new due date of the title after renegotiation."
                                        }
                                    },
                                    "required": [
                                        "title",
                                        "value",
                                        "renegotiation_date",
                                        "original_due_date",
                                        "new_due_date"
                                    ],
                                    "additionalProperties": false
                                }
                            },
                            "cash_flow_summary": {
                                "type": "array",
                                "description": "Monthly summary of renegotiated amounts.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "month_year": {
                                            "type": "string",
                                            "description": "The month and year of the cash flow."
                                        },
                                        "total_renegotiated": {
                                            "type": "string",
                                            "description": "Total amount renegotiated for the month."
                                        }
                                    },
                                    "required": [
                                        "month_year",
                                        "total_renegotiated"
                                    ],
                                    "additionalProperties": false
                                }
                            },
                            "notes": {
                                "type": "string",
                                "description": "Additional notes regarding the renegotiation process."
                            }
                        },
                        "required": [
                            "renegotiated_titles",
                            "cash_flow_summary",
                            "notes"
                        ],
                        "additionalProperties": false
                    }
                }
            },
        });

        const response = completion.choices[0].message.content;

        if (!response) {
            throw new Error("No response from OpenAI");
        }

        return response;
    }
}
