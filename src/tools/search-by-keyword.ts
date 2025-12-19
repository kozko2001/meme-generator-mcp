import { z } from 'zod';
import { searchByKeyword } from '../templates/search.js';
import { templates } from '../templates/catalog.js';
import { templateMetadata } from '../templates/metadata.js';

export const searchByKeywordSchema = {
  name: 'search_templates_by_keyword',
  description: `Search for meme templates by semantic keywords or concepts.

This tool searches through pre-indexed keywords to find relevant templates. It supports both exact and fuzzy matching.

Example searches:
- "surprised" → astronaut, scc, whatyear, gandalf
- "preference" → drake, pooh, glasses
- "awkward" → ams, awkward, harold
- "confused" → fry, gandalf, noidea, pigeon
- "argument" → chair, red, woman-cat
- "happy" → feelsgood, success, awesome
- "conspiracy" → keanu, philosoraptor, aag

The search returns templates ranked by relevance based on keyword matches and usage description similarity.

Use this when you know the concept or emotion but aren't sure which category or template to use.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search query (keywords or concepts to search for)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
      },
    },
    required: ['query'],
  },
};

export const searchByKeywordInputSchema = z.object({
  query: z.string().min(1, 'Query must not be empty'),
  limit: z.number().int().positive().optional().default(10),
});

export interface TemplateSearchResult {
  id: string;
  name: string;
  usage: string;
  slots: number;
  category: string;
  relevance: number;
}

export interface SearchByKeywordResult {
  query: string;
  results: TemplateSearchResult[];
  count: number;
}

export function searchTemplatesByKeyword(query: string, limit: number = 10): SearchByKeywordResult {
  const searchResults = searchByKeyword(query);

  // Take top N results based on limit
  const limitedResults = searchResults.slice(0, limit);

  // Enrich with template data
  const enrichedResults: TemplateSearchResult[] = limitedResults.map(result => {
    const template = templates[result.templateId];
    const metadata = templateMetadata[result.templateId];

    if (!template || !metadata) {
      throw new Error(`Template "${result.templateId}" not found`);
    }

    return {
      id: template.id,
      name: template.name,
      usage: metadata.usage,
      slots: template.slots,
      category: metadata.category,
      relevance: Math.round(result.relevance * 100) / 100, // Round to 2 decimals
    };
  });

  return {
    query,
    results: enrichedResults,
    count: enrichedResults.length,
  };
}
