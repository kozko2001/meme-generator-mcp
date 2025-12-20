#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  generateMemeTool,
  GenerateMemeArgsSchema,
  handleGenerateMeme,
} from './tools/generate-meme.js';
import {
  browseCategoriesSchema,
  browseCategoriesInputSchema,
  browseCategories,
} from './tools/browse-categories.js';
import {
  searchByCategorySchema,
  searchByCategoryInputSchema,
  searchByCategory,
} from './tools/search-by-category.js';
import {
  searchByKeywordSchema,
  searchByKeywordInputSchema,
  searchTemplatesByKeyword,
} from './tools/search-by-keyword.js';
import {
  getTemplateDetailsSchema,
  getTemplateDetailsInputSchema,
  getTemplateDetails,
} from './tools/get-template-details.js';
import {
  fetchContentSchema,
  fetchContentInputSchema,
  fetchUrlContent,
} from './tools/fetch-content.js';
import {
  suggestTemplatesSchema,
  suggestTemplatesInputSchema,
  suggestTemplates,
} from './tools/suggest-templates.js';
import {
  extractQuotesSchema,
  extractQuotesInputSchema,
  extractKeyQuotes,
} from './tools/extract-quotes.js';
import http from 'http';
import { URL } from 'url';

/**
 * Create and configure the MCP server
 */
function createServer() {
  const server = new Server(
    {
      name: 'meme-generator-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * Handler for listing available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        browseCategoriesSchema,
        searchByCategorySchema,
        searchByKeywordSchema,
        getTemplateDetailsSchema,
        generateMemeTool,
        fetchContentSchema,
        suggestTemplatesSchema,
        extractQuotesSchema,
      ],
    };
  });

  /**
   * Handler for tool execution
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'browse_meme_categories': {
          const result = browseCategories();
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'search_templates_by_category': {
          const validatedArgs = searchByCategoryInputSchema.parse(args);
          const result = searchByCategory(validatedArgs.category);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'search_templates_by_keyword': {
          const validatedArgs = searchByKeywordInputSchema.parse(args);
          const result = searchTemplatesByKeyword(
            validatedArgs.query,
            validatedArgs.limit
          );
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_template_details': {
          const validatedArgs = getTemplateDetailsInputSchema.parse(args);
          const result = getTemplateDetails(validatedArgs.template_ids);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'generate_meme': {
          const validatedArgs = GenerateMemeArgsSchema.parse(args);
          const results = await handleGenerateMeme(validatedArgs);

          const successCount = results.filter((r) => r.success).length;
          const total = results.length;

          // Build summary text
          const summaryText =
            total === 1 && results[0].success
              ? `Meme generated successfully!\n\nURL: ${results[0].url}\n\nTemplate: ${results[0].template}`
              : `Batch: ${successCount}/${total} memes generated\n\n` +
                results
                  .map((r, i) =>
                    r.success
                      ? `✓ ${i + 1}. ${r.template}: ${r.url}`
                      : `✗ ${i + 1}. ${r.template}: ${r.error}`
                  )
                  .join('\n');

          return {
            content: [
              {
                type: 'text' as const,
                text: summaryText,
              },
              // Add all successful meme images
              ...results
                .filter((r) => r.success)
                .map((r) => ({
                  type: 'image' as const,
                  data: r.base64Image!,
                  mimeType: 'image/png' as const,
                })),
            ],
          };
        }

        case 'fetch_url_content': {
          const validatedArgs = fetchContentInputSchema.parse(args);
          const result = await fetchUrlContent(validatedArgs);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'suggest_templates': {
          const validatedArgs = suggestTemplatesInputSchema.parse(args);
          const result = suggestTemplates(validatedArgs);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'extract_key_quotes': {
          const validatedArgs = extractQuotesInputSchema.parse(args);
          const result = extractKeyQuotes(validatedArgs);
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  });

  return server;
}

/**
 * Start the server in stdio mode (for desktop clients)
 */
async function startStdio() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}

/**
 * Start the server in HTTP/SSE mode (for web clients)
 */
async function startHttp(port: number) {
  // Store active server instances per session
  const sessions = new Map<string, { server: any; transport: any }>();

  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // CORS headers
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
    const origin = req.headers.origin || '*';

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');
    res.setHeader('Access-Control-Expose-Headers', 'X-Session-ID');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'meme-generator-mcp' }));
      return;
    }

    // SSE endpoint
    if (url.pathname === '/sse' && req.method === 'GET') {
      // Generate session ID
      const sessionId = Math.random().toString(36).substring(7);

      console.log(`New SSE connection: ${sessionId}`);

      // Create new server instance for this session
      const server = createServer();
      const transport = new SSEServerTransport(`/message/${sessionId}`, res);

      // Store session
      sessions.set(sessionId, { server, transport });

      // Set session ID header
      res.setHeader('X-Session-ID', sessionId);

      // Connect server to transport
      await server.connect(transport);

      // Cleanup on close
      req.on('close', async () => {
        console.log(`SSE connection closed: ${sessionId}`);
        await server.close();
        sessions.delete(sessionId);
      });

      return;
    }

    // Message endpoint for SSE (POST requests from client)
    if (url.pathname.startsWith('/message/') && req.method === 'POST') {
      const sessionId = url.pathname.split('/')[2];
      const session = sessions.get(sessionId);

      if (!session) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }

      // The SSEServerTransport expects to read the body itself
      // So we just pass the raw request and response
      try {
        console.log(`Forwarding message to session ${sessionId}`);
        await session.transport.handlePostMessage(req, res);
      } catch (error) {
        console.error('Error handling message:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }

      return;
    }

    // 404 for other paths
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  httpServer.listen(port, () => {
    console.log(`MCP server running on http://0.0.0.0:${port}`);
    console.log(`SSE endpoint: http://0.0.0.0:${port}/sse`);
    console.log(`Health check: http://0.0.0.0:${port}/health`);
  });

  process.on('SIGINT', () => {
    httpServer.close();
    process.exit(0);
  });
}

/**
 * Main entry point
 */
async function main() {
  const mode = process.env.MCP_TRANSPORT || 'stdio';
  const port = parseInt(process.env.PORT || '3000', 10);

  if (mode === 'http') {
    console.log('Starting in HTTP/SSE mode...');
    await startHttp(port);
  } else {
    console.log('Starting in stdio mode...');
    await startStdio();
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
