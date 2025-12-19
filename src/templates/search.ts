import { templateMetadata } from './metadata.js';

export interface SearchResult {
  templateId: string;
  relevance: number;
}

// Build keyword index from metadata
export function buildKeywordIndex(): Record<string, Set<string>> {
  const index: Record<string, Set<string>> = {};

  for (const [templateId, metadata] of Object.entries(templateMetadata)) {
    for (const keyword of metadata.keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      if (!index[normalizedKeyword]) {
        index[normalizedKeyword] = new Set();
      }
      index[normalizedKeyword].add(templateId);
    }
  }

  return index;
}

// Pre-computed keyword index for fast lookups
const keywordIndex = buildKeywordIndex();

// Normalize search query
function normalizeQuery(query: string): string {
  return query.toLowerCase().trim();
}

// Calculate relevance score based on keyword matches
function calculateRelevance(templateId: string, matchedKeywords: string[], queryTerms: string[]): number {
  const metadata = templateMetadata[templateId];
  if (!metadata) return 0;

  let score = 0;

  // Exact keyword matches
  const exactMatches = matchedKeywords.filter(kw =>
    queryTerms.some(term => kw === term)
  );
  score += exactMatches.length * 2;

  // Partial keyword matches
  const partialMatches = matchedKeywords.filter(kw =>
    queryTerms.some(term => kw.includes(term) || term.includes(kw))
  );
  score += partialMatches.length;

  // Usage text contains query terms
  const usageLower = metadata.usage.toLowerCase();
  for (const term of queryTerms) {
    if (usageLower.includes(term)) {
      score += 0.5;
    }
  }

  // Normalize by total keywords to favor precision
  return score / (metadata.keywords.length + 1);
}

// Search templates by keyword query
export function searchByKeyword(query: string): SearchResult[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const queryTerms = normalized.split(/\s+/);
  const matchedTemplates = new Map<string, string[]>(); // templateId -> matched keywords

  // Find all templates matching any query term
  for (const term of queryTerms) {
    // Exact keyword match
    if (keywordIndex[term]) {
      for (const templateId of keywordIndex[term]) {
        if (!matchedTemplates.has(templateId)) {
          matchedTemplates.set(templateId, []);
        }
        matchedTemplates.get(templateId)!.push(term);
      }
    }

    // Partial keyword match (fuzzy)
    for (const [keyword, templates] of Object.entries(keywordIndex)) {
      if (keyword.includes(term) && keyword !== term) {
        for (const templateId of templates) {
          if (!matchedTemplates.has(templateId)) {
            matchedTemplates.set(templateId, []);
          }
          if (!matchedTemplates.get(templateId)!.includes(keyword)) {
            matchedTemplates.get(templateId)!.push(keyword);
          }
        }
      }
    }
  }

  // Calculate relevance scores
  const results: SearchResult[] = [];
  for (const [templateId, matchedKeywords] of matchedTemplates.entries()) {
    const relevance = calculateRelevance(templateId, matchedKeywords, queryTerms);
    if (relevance > 0) {
      results.push({ templateId, relevance });
    }
  }

  // Sort by relevance (descending)
  results.sort((a, b) => b.relevance - a.relevance);

  return results;
}

// Get all unique keywords (for debugging/inspection)
export function getAllKeywords(): string[] {
  return Object.keys(keywordIndex).sort();
}

// Get templates by exact keyword match
export function getTemplatesByKeyword(keyword: string): string[] {
  const normalized = normalizeQuery(keyword);
  return Array.from(keywordIndex[normalized] || []);
}
