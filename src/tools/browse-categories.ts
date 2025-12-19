import { z } from 'zod';
import { categories } from '../templates/categories.js';

export const browseCategoriesSchema = {
  name: 'browse_meme_categories',
  description: `Browse meme template categories to discover templates by semantic meaning.

Returns a list of 9 categories organizing all 207 meme templates:
- reactions: Express emotions, surprise, shock, happiness, disappointment
- comparisons: Compare options, show preferences, A vs B situations
- social: Awkward moments, social interactions, relationships
- questioning: Doubt, confusion, philosophical questions, skepticism
- success-fail: Achievements, victories, bad luck, mistakes
- statements: Hot takes, opinions, declarations, warnings
- narrative: Multi-panel stories, conversations, arguments
- meta: Memes about memes, internet culture, self-aware humor
- characters: Specific people, politicians, TV/movie characters

Use this tool to explore what types of memes are available, then use search_templates_by_category to see templates in a specific category.`,
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export const browseCategoriesInputSchema = z.object({});

export interface CategorySummary {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface BrowseCategoriesResult {
  categories: CategorySummary[];
  total_templates: number;
}

export function browseCategories(): BrowseCategoriesResult {
  const categorySummaries: CategorySummary[] = Object.values(categories).map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    count: cat.templates.length,
  }));

  const totalTemplates = categorySummaries.reduce((sum, cat) => sum + cat.count, 0);

  return {
    categories: categorySummaries,
    total_templates: totalTemplates,
  };
}
