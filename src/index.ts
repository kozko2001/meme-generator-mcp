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
      tools: [generateMemeTool],
    };
  });

  /**
   * Handler for tool execution
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'generate_meme') {
      try {
        const validatedArgs = GenerateMemeArgsSchema.parse(args);
        const result = await handleGenerateMeme(validatedArgs);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Meme generated successfully!\n\nURL: ${result.url}\n\nTemplate: ${validatedArgs.template}\nTop: "${validatedArgs.top_text}"\nBottom: "${validatedArgs.bottom_text}"`,
            },
            {
              type: 'image' as const,
              data: result.base64Image,
              mimeType: 'image/png',
            },
          ],
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error generating meme: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    }

    throw new Error(`Unknown tool: ${name}`);
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
  const httpServer = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // CORS headers
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
    const origin = req.headers.origin || '*';

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    if (url.pathname === '/sse') {
      const server = createServer();
      const transport = new SSEServerTransport(url.pathname, res);
      await server.connect(transport);

      req.on('close', async () => {
        await server.close();
      });
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
