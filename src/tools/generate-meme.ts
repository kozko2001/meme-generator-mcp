import { z } from 'zod';
import { buildMemeUrl } from '../utils/memegen.js';
import { getTemplateIds, isValidTemplate } from '../templates/catalog.js';

/**
 * Input schema for generate_meme tool
 */
export const GenerateMemeArgsSchema = z.object({
  template: z.enum(getTemplateIds() as [string, ...string[]]),
  top_text: z.string(),
  bottom_text: z.string(),
});

export type GenerateMemeArgs = z.infer<typeof GenerateMemeArgsSchema>;

/**
 * Tool definition for MCP
 */
export const generateMemeTool = {
  name: 'generate_meme',
  description: `Generate a meme image using memegen.link. 200+ templates available! Choose the template that best matches your humor. Popular templates include:

  • drake: Rejecting one thing in favor of another
  • db (Distracted Boyfriend): Being tempted by something new
  • cmm (Change My Mind): Stating controversial opinions
  • pigeon: Misidentifying something obvious
  • buzz (X, X Everywhere): Something being everywhere
  • fry (Futurama Fry): Being suspicious or unsure
  • success (Success Kid): Celebrating small victories
  • doge: Much wow, such meme
  • fine (This is Fine): Everything is on fire but it's fine
  • stonks: Financial decisions (good or bad)
  • woman-cat: Two opposing viewpoints arguing
  • spiderman: Two identical things pointing at each other

  Browse all templates at https://memegen.link/templates/`,
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
