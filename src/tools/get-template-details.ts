import { z } from 'zod';
import { templates } from '../templates/catalog.js';
import { templateMetadata } from '../templates/metadata.js';

export const getTemplateDetailsSchema = {
  name: 'get_template_details',
  description: `Get comprehensive details about specific meme template(s).

Returns full information for one or more templates including:
- Name and ID
- When and how to use it (usage description)
- Category it belongs to
- Keywords for semantic search
- Number of text slots required
- Example text lines
- Similar templates you might also consider
- Popularity level

Use this tool when you want detailed information about specific templates before generating a meme, or to explore similar alternatives.

Examples:
- get_template_details({template_ids: ["drake"]}) → Full details about the drake template
- get_template_details({template_ids: ["drake", "pooh", "glasses"]}) → Details about all three comparison templates`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      template_ids: {
        type: 'array',
        description: 'Array of template IDs to get details for',
        items: {
          type: 'string',
        },
        minItems: 1,
      },
    },
    required: ['template_ids'],
  },
};

export const getTemplateDetailsInputSchema = z.object({
  template_ids: z.array(z.string()).min(1, 'Must provide at least one template ID'),
});

export interface TemplateDetails {
  id: string;
  name: string;
  usage: string;
  category: string;
  keywords: string[];
  slots: number;
  example: string[];
  similar?: string[];
  popularity?: string;
}

export interface GetTemplateDetailsResult {
  templates: TemplateDetails[];
  count: number;
}

export function getTemplateDetails(templateIds: string[]): GetTemplateDetailsResult {
  const detailsList: TemplateDetails[] = [];
  const notFound: string[] = [];

  for (const templateId of templateIds) {
    const template = templates[templateId];
    const metadata = templateMetadata[templateId];

    if (!template || !metadata) {
      notFound.push(templateId);
      continue;
    }

    detailsList.push({
      id: template.id,
      name: template.name,
      usage: metadata.usage,
      category: metadata.category,
      keywords: metadata.keywords,
      slots: template.slots,
      example: template.example,
      similar: metadata.similar,
      popularity: metadata.popularity,
    });
  }

  if (notFound.length > 0) {
    throw new Error(`Template(s) not found: ${notFound.join(', ')}`);
  }

  return {
    templates: detailsList,
    count: detailsList.length,
  };
}
