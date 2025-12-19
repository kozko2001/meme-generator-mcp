import { z } from 'zod';
import { categories, CategoryInfo } from '../templates/categories.js';
import { templates } from '../templates/catalog.js';
import { templateMetadata, TemplateCategory } from '../templates/metadata.js';

export const searchByCategorySchema = {
  name: 'search_templates_by_category',
  description: `Search for meme templates within a specific category.

Returns all templates in the chosen category with their usage descriptions, slot counts, and examples.

Available categories:
- reactions: Emotions and emotional responses (35 templates)
- comparisons: Comparing options and showing preferences (28 templates)
- social: Social situations and interactions (24 templates)
- questioning: Doubt, confusion, and questions (18 templates)
- success-fail: Success, failure, and luck (16 templates)
- statements: Opinions and declarations (15 templates)
- narrative: Stories and dialogue (22 templates)
- meta: Self-referential and internet culture (12 templates)
- characters: Specific people and characters (37 templates)

Use browse_meme_categories first to see all categories, then use this tool to explore templates in a specific category.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string',
        description: 'The category to search in',
        enum: [
          'reactions',
          'comparisons',
          'social',
          'questioning',
          'success-fail',
          'statements',
          'narrative',
          'meta',
          'characters',
        ],
      },
    },
    required: ['category'],
  },
};

export const searchByCategoryInputSchema = z.object({
  category: z.enum([
    'reactions',
    'comparisons',
    'social',
    'questioning',
    'success-fail',
    'statements',
    'narrative',
    'meta',
    'characters',
  ]),
});

export interface TemplateInCategory {
  id: string;
  name: string;
  usage: string;
  slots: number;
  example: string[];
  popularity?: string;
}

export interface SearchByCategoryResult {
  category: string;
  category_name: string;
  category_description: string;
  templates: TemplateInCategory[];
  count: number;
}

export function searchByCategory(category: TemplateCategory): SearchByCategoryResult {
  const categoryInfo: CategoryInfo | undefined = categories[category];

  if (!categoryInfo) {
    throw new Error(`Category "${category}" not found`);
  }

  const templatesInCategory: TemplateInCategory[] = categoryInfo.templates.map(templateId => {
    const template = templates[templateId];
    const metadata = templateMetadata[templateId];

    if (!template || !metadata) {
      throw new Error(`Template "${templateId}" not found in catalog or metadata`);
    }

    return {
      id: template.id,
      name: template.name,
      usage: metadata.usage,
      slots: template.slots,
      example: template.example,
      popularity: metadata.popularity,
    };
  });

  // Sort by popularity (high > medium > low) then alphabetically
  const popularityOrder = { high: 0, medium: 1, low: 2 };
  templatesInCategory.sort((a, b) => {
    const popA = popularityOrder[a.popularity as keyof typeof popularityOrder] ?? 3;
    const popB = popularityOrder[b.popularity as keyof typeof popularityOrder] ?? 3;
    if (popA !== popB) return popA - popB;
    return a.name.localeCompare(b.name);
  });

  return {
    category: categoryInfo.id,
    category_name: categoryInfo.name,
    category_description: categoryInfo.description,
    templates: templatesInCategory,
    count: templatesInCategory.length,
  };
}
