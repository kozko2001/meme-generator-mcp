import { z } from 'zod';
import { buildMemeUrl } from '../utils/memegen.js';
import { getTemplateIds, isValidTemplate } from '../templates/catalog.js';

/**
 * Input schema for generate_meme tool
 */
export const GenerateMemeArgsSchema = z.object({
  template: z.enum(['drake', 'db', 'cmm', 'pigeon'] as const),
  top_text: z.string(),
  bottom_text: z.string(),
});

export type GenerateMemeArgs = z.infer<typeof GenerateMemeArgsSchema>;

/**
 * Tool definition for MCP
 */
export const generateMemeTool = {
  name: 'generate_meme',
  description: `Generate a meme image using memegen.link. Choose the template that best matches the humor:

  • drake: Rejecting one thing (top) in favor of another (bottom). Use when comparing two options where one is clearly preferred.
    Example: Top="Manual deployments" Bottom="CI/CD pipeline"

  • db (Distracted Boyfriend): Being tempted/distracted by something new while ignoring current thing.
    Example: Top="Current stable version" Bottom="Bleeding edge beta"

  • cmm (Change My Mind): Stating a hot take or controversial opinion. Bottom text usually empty or "change my mind".
    Example: Top="Vim is better than Emacs" Bottom=""

  • pigeon: Completely misidentifying something obvious. Character asks "Is this X?" about something that clearly isn't.
    Example: Top="A compiler warning" Bottom="Is this optional?"`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      template: {
        type: 'string' as const,
        enum: getTemplateIds(),
        description: 'The meme template to use',
      },
      top_text: {
        type: 'string' as const,
        description: 'Top/first text panel',
      },
      bottom_text: {
        type: 'string' as const,
        description: 'Bottom/second text panel (can be empty for some templates)',
      },
    },
    required: ['template', 'top_text', 'bottom_text'] as const,
  },
};

/**
 * Fetch image and convert to base64
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

/**
 * Handler for generate_meme tool
 */
export async function handleGenerateMeme(
  args: GenerateMemeArgs
): Promise<{ url: string; base64Image: string }> {
  const { template, top_text, bottom_text } = args;

  if (!isValidTemplate(template)) {
    throw new Error(`Invalid template: ${template}`);
  }

  const url = buildMemeUrl(template, top_text, bottom_text);
  const base64Image = await fetchImageAsBase64(url);

  return { url, base64Image };
}
