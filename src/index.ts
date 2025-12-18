#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  generateMemeTool,
  GenerateMemeArgsSchema,
  handleGenerateMeme,
} from './tools/generate-meme.js';

/**
 * Create and configure the MCP server
 */
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

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
