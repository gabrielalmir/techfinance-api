import { Elysia, t } from 'elysia';
import { tryCatchAsync } from 'resulta';
import { logger } from '../config/deps';
import { MCPService } from '../services/mcp/mcp.service';
import {
    MCPErrorCodes,
    createMCPResponse,
    validateMCPMessage,
    type MCPMessage
} from '../services/mcp/mcp.types';

// Instância global do serviço MCP
const mcpService = new MCPService();

export const mcpRoutes = (app: Elysia) => {
    // Endpoint principal para comunicação MCP via JSON-RPC
    app.post('/mcp', async ({ body }) => {
        logger.info('Recebida mensagem MCP', { body });

        try {
            const message = body as MCPMessage;

            // Validar mensagem MCP
            const validationErrors = validateMCPMessage(message);
            if (validationErrors.length > 0) {
                return createMCPResponse(message.id, null, {
                    code: MCPErrorCodes.INVALID_REQUEST,
                    message: 'Mensagem MCP inválida',
                    data: validationErrors
                });
            }

            // Processar método MCP
            const result = await processMCPMethod(message);
            return createMCPResponse(message.id, result);

        } catch (error: any) {
            logger.error('Erro ao processar mensagem MCP', { error });
            return createMCPResponse(undefined, null, {
                code: MCPErrorCodes.INTERNAL_ERROR,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }, {
        body: t.Object({
            jsonrpc: t.String(),
            method: t.String(),
            id: t.Optional(t.Union([t.String(), t.Number()])),
            params: t.Optional(t.Any())
        })
    });

    // Endpoint para inicialização MCP
    app.get('/mcp/initialize', async () => {
        logger.info('Inicializando servidor MCP');

        return {
            protocolVersion: '2024-11-05',
            capabilities: {
                logging: {},
                prompts: {
                    listChanged: true
                },
                resources: {
                    subscribe: true,
                    listChanged: true
                },
                tools: {
                    listChanged: true
                }
            },
            serverInfo: {
                name: 'TechFinance MCP Server',
                version: '1.0.0',
                description: 'Servidor MCP para análises financeiras e de negócios'
            }
        };
    });

    // Endpoints REST para facilitar integração
    app.get('/mcp/contexts', async () => {
        logger.info('Listando contextos MCP');
        const result = await tryCatchAsync(() => mcpService.listContexts());

        if (!result.ok) {
            logger.error('Erro ao listar contextos', { error: result.error });
            return { error: 'Erro ao listar contextos' };
        }

        return result.value;
    });

    app.post('/mcp/contexts', async ({ body }) => {
        logger.info('Criando contexto MCP', { body });
        const { name, description, data, metadata } = body as any;

        const result = await tryCatchAsync(() =>
            mcpService.createContext(name, description, data, metadata)
        );

        if (!result.ok) {
            logger.error('Erro ao criar contexto', { error: result.error });
            return { error: 'Erro ao criar contexto' };
        }

        return result.value;
    }, {
        body: t.Object({
            name: t.String(),
            description: t.String(),
            data: t.Any(),
            metadata: t.Optional(t.Any())
        })
    });

    app.get('/mcp/contexts/:id', async ({ params }) => {
        logger.info('Obtendo contexto MCP', { contextId: params.id });
        const context = await mcpService.getContext(params.id);

        if (!context) {
            return { error: 'Contexto não encontrado' };
        }

        return context;
    });

    app.put('/mcp/contexts/:id', async ({ params, body }) => {
        logger.info('Atualizando contexto MCP', { contextId: params.id, body });
        const updates = body as any;

        const result = await tryCatchAsync(() =>
            mcpService.updateContext(params.id, updates)
        );

        if (!result.ok) {
            logger.error('Erro ao atualizar contexto', { error: result.error });
            return { error: 'Erro ao atualizar contexto' };
        }

        if (!result.value) {
            return { error: 'Contexto não encontrado' };
        }

        return result.value;
    });

    app.delete('/mcp/contexts/:id', async ({ params }) => {
        logger.info('Removendo contexto MCP', { contextId: params.id });
        const deleted = await mcpService.deleteContext(params.id);

        if (!deleted) {
            return { error: 'Contexto não encontrado' };
        }

        return { success: true };
    });

    app.get('/mcp/tools', async () => {
        logger.info('Listando ferramentas MCP');
        return await mcpService.listTools();
    });

    app.post('/mcp/tools/:name/execute', async ({ params, body }) => {
        logger.info('Executando ferramenta MCP', { toolName: params.name, body });

        const result = await tryCatchAsync(() =>
            mcpService.executeTool(params.name, body)
        );
        if (!result.ok) {
            logger.error('Erro ao executar ferramenta', { error: result.error });
            const errorMessage = result.error instanceof Error ? result.error.message : 'Erro desconhecido';
            return { error: errorMessage };
        }

        return result.value;
    });

    app.get('/mcp/prompts', async () => {
        logger.info('Listando prompts MCP');
        return await mcpService.listPrompts();
    });

    app.get('/mcp/prompts/:name', async ({ params, query }) => {
        logger.info('Obtendo prompt MCP', { promptName: params.name, variables: query });

        const prompt = await mcpService.getPrompt(params.name, query);

        if (!prompt) {
            return { error: 'Prompt não encontrado' };
        }

        return { prompt };
    });

    app.get('/mcp/resources', async () => {
        logger.info('Listando recursos MCP');
        return await mcpService.listResources();
    });

    app.get('/mcp/resources/:uri', async ({ params }) => {
        logger.info('Obtendo recurso MCP', { resourceUri: params.uri });

        const resource = await mcpService.getResource(decodeURIComponent(params.uri));

        if (!resource) {
            return { error: 'Recurso não encontrado' };
        }

        return resource;
    });
};

// Função auxiliar para processar métodos MCP via JSON-RPC
async function processMCPMethod(message: MCPMessage): Promise<any> {
    const { method, params = {} } = message;

    switch (method) {
        case 'initialize':
            return {
                protocolVersion: '2024-11-05',
                capabilities: {
                    logging: {},
                    prompts: { listChanged: true },
                    resources: { subscribe: true, listChanged: true },
                    tools: { listChanged: true }
                },
                serverInfo: {
                    name: 'TechFinance MCP Server',
                    version: '1.0.0',
                    description: 'Servidor MCP para análises financeiras e de negócios'
                }
            };

        case 'list_resources':
            return {
                resources: await mcpService.listResources()
            };

        case 'list_tools':
            return {
                tools: await mcpService.listTools()
            };

        case 'list_prompts':
            return {
                prompts: await mcpService.listPrompts()
            };

        case 'call_tool':
            const { name, arguments: args } = params;
            if (!name) {
                throw new Error('Nome da ferramenta é obrigatório');
            }
            return {
                content: await mcpService.executeTool(name, args)
            };

        case 'get_prompt':
            const { name: promptName, arguments: promptArgs } = params;
            if (!promptName) {
                throw new Error('Nome do prompt é obrigatório');
            }
            const prompt = await mcpService.getPrompt(promptName, promptArgs);
            if (!prompt) {
                throw new Error(`Prompt não encontrado: ${promptName}`);
            }
            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: prompt
                        }
                    }
                ]
            };

        case 'read_resource':
            const { uri } = params;
            if (!uri) {
                throw new Error('URI do recurso é obrigatório');
            }
            const resource = await mcpService.getResource(uri);
            if (!resource) {
                throw new Error(`Recurso não encontrado: ${uri}`);
            }
            return {
                contents: [
                    {
                        uri: resource.uri,
                        mimeType: resource.mimeType || 'application/json',
                        text: typeof resource.data === 'string' ? resource.data : JSON.stringify(resource.data)
                    }
                ]
            };

        case 'create_context':
            const { name: contextName, description, data, metadata } = params;
            return await mcpService.createContext(contextName, description, data, metadata);

        case 'update_context':
            const { id: contextId, updates } = params;
            const updatedContext = await mcpService.updateContext(contextId, updates);
            if (!updatedContext) {
                throw new Error(`Contexto não encontrado: ${contextId}`);
            }
            return updatedContext;

        case 'delete_context':
            const { id: deleteContextId } = params;
            const deleted = await mcpService.deleteContext(deleteContextId);
            if (!deleted) {
                throw new Error(`Contexto não encontrado: ${deleteContextId}`);
            }
            return { success: true };

        case 'get_context':
            const { id: getContextId } = params;
            const context = await mcpService.getContext(getContextId);
            if (!context) {
                throw new Error(`Contexto não encontrado: ${getContextId}`);
            }
            return context;

        default:
            throw new Error(`Método MCP não suportado: ${method}`);
    }
}
