// Interface base para todos os protocolos MCP
export interface MCPProtocol {
    version: string;
    implementation: string;
}

// Interface para recursos MCP
export interface MCPResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
    annotations?: Record<string, any>;
}

// Interface para ferramentas MCP
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties?: Record<string, any>;
        required?: string[];
    };
}

// Interface para prompts MCP
export interface MCPPrompt {
    name: string;
    description: string;
    arguments?: Array<{
        name: string;
        description: string;
        required?: boolean;
    }>;
}

// Interface para contextos MCP
export interface MCPContext {
    id: string;
    name: string;
    description: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

// Tipos de mensagens MCP
export type MCPMessageType =
    | 'initialize'
    | 'list_resources'
    | 'list_tools'
    | 'list_prompts'
    | 'call_tool'
    | 'get_prompt'
    | 'read_resource'
    | 'create_context'
    | 'update_context'
    | 'delete_context'
    | 'get_context';

// Interface para mensagens MCP
export interface MCPMessage {
    jsonrpc: '2.0';
    id?: string | number;
    method: MCPMessageType;
    params?: Record<string, any>;
}

// Interface para respostas MCP
export interface MCPResponse {
    jsonrpc: '2.0';
    id?: string | number;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

// Códigos de erro MCP padrão
export const MCPErrorCodes = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    RESOURCE_NOT_FOUND: -32001,
    TOOL_NOT_FOUND: -32002,
    PROMPT_NOT_FOUND: -32003,
    CONTEXT_NOT_FOUND: -32004,
    UNAUTHORIZED: -32005
} as const;

// Utilitários para validação de esquemas
export interface MCPValidationError {
    field: string;
    message: string;
    value?: any;
}

export function validateMCPMessage(message: any): MCPValidationError[] {
    const errors: MCPValidationError[] = [];

    if (!message.jsonrpc || message.jsonrpc !== '2.0') {
        errors.push({
            field: 'jsonrpc',
            message: 'Campo obrigatório deve ser "2.0"',
            value: message.jsonrpc
        });
    }

    if (!message.method || typeof message.method !== 'string') {
        errors.push({
            field: 'method',
            message: 'Campo obrigatório deve ser string',
            value: message.method
        });
    }

    return errors;
}

export function createMCPResponse(id: string | number | undefined, result?: any, error?: any): MCPResponse {
    const response: MCPResponse = {
        jsonrpc: '2.0',
        id
    };

    if (error) {
        response.error = {
            code: error.code || MCPErrorCodes.INTERNAL_ERROR,
            message: error.message || 'Internal error',
            data: error.data
        };
    } else {
        response.result = result;
    }

    return response;
}

// Interfaces específicas para TechFinance
export interface TechFinanceContext extends MCPContext {
    data: {
        customerId?: number;
        salesData?: any[];
        receivablesData?: any[];
        period?: {
            start: string;
            end: string;
        };
        analysisType?: 'customer' | 'sales' | 'financial' | 'renegotiation';
    };
}

export interface FinancialAnalysisParams {
    data: any[];
    analysisType: 'cash_flow' | 'receivables' | 'sales' | 'profitability';
    period?: {
        start: string;
        end: string;
    };
    filters?: Record<string, any>;
}

export interface ReportGenerationParams {
    reportType: 'customers' | 'sales' | 'receivables' | 'financial_summary';
    format: 'json' | 'csv' | 'pdf';
    filters?: Record<string, any>;
    includeCharts?: boolean;
    template?: string;
}

export interface RenegotiationAnalysisParams {
    titles: Array<{
        id: string;
        value: number;
        dueDate: string;
        customerId: number;
        status: string;
    }>;
    criteria: {
        maxRenegotiationDays: number;
        discountPercentage?: number;
        priorityByAmount?: boolean;
    };
    baseDate: string;
}
