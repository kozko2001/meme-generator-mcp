import { z } from 'zod';
import nlp from 'compromise';

/**
 * Input schema for extract_quotes tool
 */
export const extractQuotesInputSchema = z.object({
  content: z.string().min(1),
  maxLength: z.number().min(10).max(200).optional().default(100),
  limit: z.number().min(1).max(20).optional().default(10),
});

export type ExtractQuotesArgs = z.infer<typeof extractQuotesInputSchema>;

export interface ExtractedQuote {
  text: string;
  score: number;
  reason: string;
  position: 'beginning' | 'middle' | 'end';
}

/**
 * Tool definition for MCP
 */
export const extractQuotesSchema = {
  name: 'extract_key_quotes',
  description: `Extract punchlines, key phrases, and meme-worthy quotes from text content using NLP.

This tool uses compromise (NLP library) to analyze text and identify the most impactful, funny, or quotable phrases:
- Part-of-speech tagging (prioritize sentences with strong verbs/adjectives)
- Sentence structure analysis (short, punchy sentences)
- Position weighting (opening hooks, closing punchlines)
- Pattern recognition (questions, exclamations, contrasts)
- Grammatical importance scoring
- Length optimization for meme readability

Use this when:
- You have long content and need to extract meme-worthy parts
- You need short, punchy text for memes (most templates need 10-50 chars per slot)
- You want to find the key moments or punchlines in content

Returns up to 20 quotes with:
- The extracted text
- Quality score
- Reason why it was selected
- Position in original content

Great for:
- Turning articles into meme text
- Finding the best quotes from long content
- Auto-generating meme text variations

After extraction, you can:
1. Use these quotes directly in generate_meme
2. Combine multiple quotes for multi-slot templates
3. Edit/shorten further if needed`,
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'Text content to extract quotes from',
      },
      maxLength: {
        type: 'number',
        description: 'Maximum length for extracted quotes in characters (10-200, default: 100)',
        default: 100,
      },
      limit: {
        type: 'number',
        description: 'Maximum number of quotes to return (1-20, default: 10)',
        default: 10,
      },
    },
    required: ['content'],
  },
};

/**
 * Split content into sentences using NLP
 */
function splitIntoSentences(text: string): string[] {
  const doc = nlp(text);
  return doc.sentences().out('array');
}

/**
 * Score a potential quote for meme-worthiness using NLP
 */
function scoreQuote(
  sentence: string,
  position: number,
  total: number,
  maxLength: number
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const lower = sentence.toLowerCase();
  const doc = nlp(sentence);

  // Length scoring (prefer short, punchy text)
  if (sentence.length <= maxLength) {
    if (sentence.length <= 50) {
      score += 5;
      reasons.push('Very concise');
    } else if (sentence.length <= 80) {
      score += 3;
      reasons.push('Concise');
    } else {
      score += 1;
      reasons.push('Acceptable length');
    }
  } else {
    // Penalize too-long quotes
    score -= 2;
  }

  // Position scoring (openings and endings are often punchlines)
  const relativePosition = position / total;
  if (position === 0) {
    score += 2;
    reasons.push('Opening hook');
  } else if (position === total - 1) {
    score += 3;
    reasons.push('Closing punchline');
  } else if (relativePosition < 0.2) {
    score += 1;
    reasons.push('Near beginning');
  } else if (relativePosition > 0.8) {
    score += 2;
    reasons.push('Near end');
  }

  // Pattern-based scoring
  if (sentence.includes('?')) {
    score += 2;
    reasons.push('Question');
  }

  if (sentence.includes('!')) {
    score += 1;
    reasons.push('Exclamation');
  }

  // Contrast/comparison patterns
  if (/\b(but|however|yet|although|while|whereas|instead)\b/i.test(lower)) {
    score += 2;
    reasons.push('Contains contrast');
  }

  // Direct statements (good for memes)
  if (/^(i |you |we |they |this |that )/i.test(sentence)) {
    score += 1;
    reasons.push('Direct statement');
  }

  // Quoted text (often key points)
  if (sentence.includes('"') || sentence.includes("'")) {
    score += 1;
    reasons.push('Contains quote');
  }

  // Emotional language
  const emotionalWords = [
    'love',
    'hate',
    'amazing',
    'terrible',
    'shocking',
    'surprising',
    'ironic',
    'ridiculous',
    'absurd',
    'perfect',
  ];
  if (emotionalWords.some((word) => lower.includes(word))) {
    score += 2;
    reasons.push('Emotional language');
  }

  // Meme-friendly patterns
  if (/\b(literally|actually|basically|obviously|clearly)\b/i.test(lower)) {
    score += 1;
    reasons.push('Meme-friendly language');
  }

  // Actionable/imperative
  if (/^(stop|start|never|always|don't|do)\b/i.test(lower)) {
    score += 1;
    reasons.push('Imperative/actionable');
  }

  // NLP-enhanced scoring
  const verbs = doc.verbs();
  const adjectives = doc.adjectives();
  const nouns = doc.nouns();

  // Strong verb count (action words are punchy)
  if (verbs.length > 0) {
    score += verbs.length * 0.5;
    reasons.push(`${verbs.length} verb(s)`);
  }

  // Emotional adjectives (more impactful)
  if (adjectives.length > 0) {
    score += adjectives.length * 0.3;
    reasons.push(`${adjectives.length} adjective(s)`);
  }

  // Proper nouns (specific references are memorable)
  const properNouns = nouns.toTitleCase();
  if (properNouns.found) {
    score += 1;
    reasons.push('Contains proper noun(s)');
  }

  // Questions (grammatically detected)
  if (doc.questions().found) {
    score += 2;
    reasons.push('Grammatical question');
  }

  // Negations (add emphasis)
  if (doc.has('#Negative')) {
    score += 1;
    reasons.push('Contains negation');
  }

  return { score, reasons };
}

/**
 * Extract n-grams (multi-word phrases) as potential quotes
 */
function extractNGrams(text: string, n: number, maxLength: number): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const ngrams: string[] = [];

  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    if (ngram.length <= maxLength) {
      ngrams.push(ngram);
    }
  }

  return ngrams;
}

/**
 * Extract key quotes from content
 */
export function extractKeyQuotes(args: ExtractQuotesArgs): {
  quotes: ExtractedQuote[];
  analysis: {
    contentLength: number;
    sentenceCount: number;
    averageSentenceLength: number;
  };
} {
  const { content, maxLength, limit } = args;

  const sentences = splitIntoSentences(content);
  const totalSentences = sentences.length;

  // Score all sentences
  const scoredSentences = sentences
    .map((sentence, index) => {
      const { score, reasons } = scoreQuote(sentence, index, totalSentences, maxLength);

      const relativePosition = index / totalSentences;
      const position: 'beginning' | 'middle' | 'end' =
        relativePosition < 0.33 ? 'beginning' : relativePosition > 0.66 ? 'end' : 'middle';

      return {
        text: sentence,
        score,
        reason: reasons.join(', '),
        position,
      };
    })
    .filter((s) => s.score > 0 && s.text.length <= maxLength);

  // Also extract some n-grams for variety
  const trigrams = extractNGrams(content, 3, maxLength);
  const pentgrams = extractNGrams(content, 5, maxLength);

  const scoredNGrams = [...trigrams, ...pentgrams].map((ngram) => {
    // Simple scoring for n-grams
    let score = 1;
    const reasons = ['N-gram extract'];

    if (ngram.length <= 40) {
      score += 2;
      reasons.push('Very short');
    }

    return {
      text: ngram,
      score,
      reason: reasons.join(', '),
      position: 'middle' as const,
    };
  });

  // Combine and deduplicate
  const allQuotes = [...scoredSentences, ...scoredNGrams];
  const uniqueQuotes = Array.from(
    new Map(allQuotes.map((q) => [q.text.toLowerCase(), q])).values()
  );

  // Sort by score and take top N
  const topQuotes = uniqueQuotes.sort((a, b) => b.score - a.score).slice(0, limit);

  // Calculate analysis
  const averageSentenceLength =
    sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length || 0;

  return {
    quotes: topQuotes,
    analysis: {
      contentLength: content.length,
      sentenceCount: sentences.length,
      averageSentenceLength: Math.round(averageSentenceLength),
    },
  };
}
