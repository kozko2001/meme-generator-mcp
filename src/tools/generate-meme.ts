import { z } from 'zod';
import { buildMemeUrl } from '../utils/memegen.js';
import { getTemplateIds, isValidTemplate, templates } from '../templates/catalog.js';

/**
 * Input schema for generate_meme tool
 * BREAKING CHANGE: Now uses array-only format for zero cognitive overhead
 * Single meme = 1-item array, Multiple memes = N-item array (same format)
 */
const MemeConfigSchema = z.object({
  template: z.enum(getTemplateIds() as [string, ...string[]]),
  text_lines: z.array(z.string()).min(1).max(8),
});

export const GenerateMemeArgsSchema = z.object({
  memes: z.array(MemeConfigSchema).min(1).max(10),
});

export type GenerateMemeArgs = z.infer<typeof GenerateMemeArgsSchema>;
export type MemeConfig = z.infer<typeof MemeConfigSchema>;

/**
 * Tool definition for MCP
 */
export const generateMemeTool = {
  name: 'generate_meme',
  description: `Generate meme image(s) using memegen.link. 207 templates available!

**USAGE (always use array format):**

Single meme:
{
  "memes": [
    { "template": "drake", "text_lines": ["old way", "new way"] }
  ]
}

Multiple memes (same format, just more items):
{
  "memes": [
    { "template": "drake", "text_lines": ["foo", "bar"] },
    { "template": "fry", "text_lines": ["not sure", "or both"] },
    { "template": "doge", "text_lines": ["such wow", "very meme"] }
  ]
}

**Key insight:** Generating 3 memes is exactly as easy as 1 meme - just add array items!

Generates 1-10 memes in parallel. Partial results returned if some fail.

**IMPORTANT: Use discovery tools to find the right template:**
• browse_meme_categories - Explore 9 semantic categories
• search_templates_by_category - Get templates in a specific category
• search_templates_by_keyword - Search by concept (e.g., "surprised", "awkward")
• get_template_details - Get full details about specific templates

**Most popular templates:**
• drake: Rejecting one option, preferring another (2 lines)
• db: Distracted by something new (3 lines)
• fry: Not sure if X or Y (2 lines)
• morpheus: What if I told you... (2 lines)
• gru: Plan that goes wrong (4 lines)
• astronaut: Always has been revelation (4 lines)
• spongebob: Mocking something (2 lines)
• doge: Such wow, very meme (2 lines)
• stonks: Ironic bad logic (2 lines)
• woman-cat: Yelling vs confused (3 lines)

**Template slots vary:**
- 1-line templates: 6 available
- 2-line templates: 165 available (most common)
- 3-line templates: 21 available
- 4-line templates: 6 available
- 5-8 line templates: 9 available

If unsure which template to use, try:
1. browse_meme_categories → see what's available
2. search_templates_by_category → explore a category
3. get_template_details → check slot count and examples
4. generate_meme → create your meme(s)!

For a full catalog, visit: https://memegen.link/templates/`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      memes: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            template: {
              type: 'string' as const,
              enum: getTemplateIds(),
              description: 'Meme template ID',
            },
            text_lines: {
              type: 'array' as const,
              items: {
                type: 'string' as const,
              },
              minItems: 1,
              maxItems: 8,
              description: 'Text lines for this meme (count must match template slots)',
            },
          },
          required: ['template', 'text_lines'] as const,
        },
        minItems: 1,
        maxItems: 10,
        description: 'Array of memes to generate (1-10). Single meme = 1-item array.',
      },
    },
    required: ['memes'] as const,
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
 * Generate a single meme (internal helper)
 */
async function generateSingleMeme(
  template: string,
  text_lines: string[]
): Promise<{ url: string; base64Image: string }> {
  if (!isValidTemplate(template)) {
    throw new Error(`Invalid template: ${template}`);
  }

  // Validate slot count matches template requirements
  const templateInfo = templates[template];
  if (text_lines.length !== templateInfo.slots) {
    throw new Error(
      `Template '${template}' requires exactly ${templateInfo.slots} text lines, got ${text_lines.length}. ` +
        `Example: ${JSON.stringify(templateInfo.example)}`
    );
  }

  const url = buildMemeUrl(template, text_lines);
  const base64Image = await fetchImageAsBase64(url);

  return { url, base64Image };
}

/**
 * Generate multiple memes in parallel with best-effort error handling
 */
async function generateBatchMemes(
  memes: MemeConfig[]
): Promise<
  Array<{
    success: boolean;
    template: string;
    url?: string;
    base64Image?: string;
    error?: string;
  }>
> {
  const results = await Promise.allSettled(
    memes.map((m) => generateSingleMeme(m.template, m.text_lines))
  );

  return results.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return {
        success: true,
        template: memes[idx].template,
        ...result.value,
      };
    } else {
      return {
        success: false,
        template: memes[idx].template,
        error: result.reason.message || String(result.reason),
      };
    }
  });
}

/**
 * Handler for generate_meme tool
 * Always processes as batch (single meme = 1-item array)
 */
export async function handleGenerateMeme(args: GenerateMemeArgs) {
  return await generateBatchMemes(args.memes);
}
