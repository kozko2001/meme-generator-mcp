import { z } from 'zod';
import { buildMemeUrl } from '../utils/memegen.js';
import { getTemplateIds, isValidTemplate, templates } from '../templates/catalog.js';

/**
 * Input schema for generate_meme tool
 */
export const GenerateMemeArgsSchema = z.object({
  template: z.enum(getTemplateIds() as [string, ...string[]]),
  text_lines: z.array(z.string()).min(1).max(8),
});

export type GenerateMemeArgs = z.infer<typeof GenerateMemeArgsSchema>;

/**
 * Tool definition for MCP
 */
export const generateMemeTool = {
  name: 'generate_meme',
  description: `Generate a meme image using memegen.link. 207 templates available!

**IMPORTANT: Use discovery tools to find the right template:**
• browse_meme_categories - Explore 9 semantic categories
• search_templates_by_category - Get templates in a specific category
• search_templates_by_keyword - Search by concept (e.g., "surprised", "awkward")
• get_template_details - Get full details about specific templates

**Most popular templates (if you already know what you want):**
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

**Usage:**
1. Provide the template ID (e.g., "drake", "fry")
2. Provide text_lines array matching the template's slot count
3. Returns both URL and base64-encoded image

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
4. generate_meme → create your meme!

For a full catalog, visit: https://memegen.link/templates/`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      template: {
        type: 'string' as const,
        enum: getTemplateIds(),
        description: 'The meme template to use',
      },
      text_lines: {
        type: 'array' as const,
        items: {
          type: 'string' as const,
        },
        minItems: 1,
        maxItems: 8,
        description: 'Array of text lines for the meme (1-8 lines depending on template)',
      },
    },
    required: ['template', 'text_lines'] as const,
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
  const { template, text_lines } = args;

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
