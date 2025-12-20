import { z } from 'zod';
import nlp from 'compromise';
import { templateMetadata, TemplateCategory } from '../templates/metadata.js';
import { templates } from '../templates/catalog.js';

/**
 * Input schema for suggest_templates tool
 */
export const suggestTemplatesInputSchema = z.object({
  content: z.string().min(1),
  limit: z.number().min(1).max(10).optional().default(5),
});

export type SuggestTemplatesArgs = z.infer<typeof suggestTemplatesInputSchema>;

export interface TemplateSuggestion {
  template: string;
  name: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  usage: string;
  slots: number;
  category: TemplateCategory;
}

/**
 * Tool definition for MCP
 */
export const suggestTemplatesSchema = {
  name: 'suggest_templates',
  description: `Analyze text content and suggest appropriate meme templates using NLP-powered pattern matching.

This tool uses compromise (NLP library) to analyze text structure, grammar, and sentiment. It helps Claude pick the right template faster.

Use this when:
- You have text content and need template suggestions
- You want to see which templates might work best
- User asks "what meme should I make from this?"

The tool analyzes:
- Grammar and sentence structure (questions, statements, comparisons)
- Verb tenses (past vs present for before/after patterns)
- Part-of-speech tags (verbs, adjectives, nouns)
- Keywords and phrases (e.g., "distracted" → distracted boyfriend)
- Sentiment and emotional language
- Common meme patterns

Returns up to 10 suggestions with:
- Template ID and name
- Reason for suggestion (with linguistic insights)
- Confidence level (high/medium/low)
- Template usage description
- Number of text slots required

After getting suggestions, you can:
1. Use get_template_details to learn more about suggested templates
2. Pick the best match based on context
3. Generate the meme with generate_meme`,
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'Text content to analyze for template suggestions',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of suggestions to return (1-10, default: 5)',
        default: 5,
      },
    },
    required: ['content'],
  },
};

/**
 * Detect sentiment and structure using NLP
 */
function analyzeContent(text: string): {
  // Sentiment
  surprise: boolean;
  confusion: boolean;
  irony: boolean;
  preference: boolean;
  comparison: boolean;
  question: boolean;
  success: boolean;
  failure: boolean;
  awkward: boolean;
  confident: boolean;

  // Grammatical features
  hasPastTense: boolean;
  hasPresentTense: boolean;
  hasFutureTense: boolean;
  hasNegation: boolean;
  hasContrast: boolean;

  // Structure
  questionCount: number;
  exclamationCount: number;
  sentenceCount: number;
} {
  const doc = nlp(text);
  const lower = text.toLowerCase();

  // Count questions and exclamations
  const questions = doc.questions();
  const questionCount = questions.length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const sentenceCount = doc.sentences().length;

  // Detect verb tenses
  const hasPastTense = doc.verbs().toPastTense().found;
  const hasPresentTense = doc.verbs().toPresentTense().found;
  const hasFutureTense = doc.has('#FutureTense');

  // Detect negation
  const hasNegation = doc.has('#Negative') || /\b(not|no|never|n't)\b/i.test(text);

  // Detect contrast words
  const hasContrast =
    doc.match('(but|however|yet|although|while|whereas|instead)').found ||
    /\b(but now|used to|before|after)\b/i.test(lower);

  // Keyword-based sentiment (enhanced with NLP context)
  return {
    // Sentiment
    surprise: /\b(shock|surpris|unexpected|didn't expect|who knew|turns out)\b/i.test(lower),
    confusion: questionCount > 0 && /\b(confus|not sure|uncertain|unclear|don't understand|what|huh)\b/i.test(lower),
    irony: hasContrast && /\b(ironic|actually|turns out|plot twist|wouldn't you know)\b/i.test(lower),
    preference: /\b(prefer|rather|instead of|better than|vs|versus|reject|choose)\b/i.test(lower),
    comparison: hasContrast || /\b(vs|versus|compared to|rather than|instead of|while|whereas|old way|new way)\b/i.test(lower),
    question: questionCount > 0,
    success: /\b(success|win|achiev|accomplish|nailed|perfect)\b/i.test(lower),
    failure: /\b(fail|mistake|wrong|error|oops|broke)\b/i.test(lower),
    awkward: /\b(awkward|uncomfortable|cringe|embarrass)\b/i.test(lower),
    confident: /\b(obviously|clearly|of course|definitely|change my mind)\b/i.test(lower),

    // Grammatical features
    hasPastTense,
    hasPresentTense,
    hasFutureTense,
    hasNegation,
    hasContrast,

    // Structure
    questionCount,
    exclamationCount,
    sentenceCount,
  };
}

/**
 * Score a template based on content analysis
 */
function scoreTemplate(
  templateId: string,
  content: string,
  analysis: ReturnType<typeof analyzeContent>
): { score: number; reasons: string[] } {
  const lower = content.toLowerCase();
  const metadata = templateMetadata[templateId];
  if (!metadata) return { score: 0, reasons: [] };

  let score = 0;
  const reasons: string[] = [];

  // Keyword matching (most important)
  const keywordMatches = metadata.keywords.filter((keyword) =>
    lower.includes(keyword.toLowerCase())
  );
  if (keywordMatches.length > 0) {
    score += keywordMatches.length * 3;
    reasons.push(`Keywords matched: ${keywordMatches.join(', ')}`);
  }

  // Sentiment-based scoring
  if (analysis.preference && metadata.category === 'comparisons') {
    score += 2;
    reasons.push('Content shows preference/comparison');
  }

  if (analysis.confusion && metadata.category === 'questioning') {
    score += 2;
    reasons.push('Content expresses confusion/uncertainty');
  }

  if (analysis.surprise && metadata.keywords.some((k) => k.includes('surprise'))) {
    score += 2;
    reasons.push('Content shows surprise');
  }

  if (analysis.awkward && metadata.category === 'social') {
    score += 2;
    reasons.push('Content describes awkward situation');
  }

  if (analysis.confident && metadata.keywords.some((k) => k.includes('opinion'))) {
    score += 2;
    reasons.push('Content expresses strong opinion');
  }

  if (analysis.success && metadata.category === 'success-fail') {
    score += 2;
    reasons.push('Content mentions success/achievement');
  }

  if (analysis.failure && metadata.category === 'success-fail') {
    score += 2;
    reasons.push('Content mentions failure/mistake');
  }

  // NLP-enhanced scoring
  if (analysis.hasPastTense && analysis.hasPresentTense && metadata.category === 'comparisons') {
    score += 3;
    reasons.push('Past/present tense contrast detected (before/after pattern)');
  }

  if (analysis.hasContrast && metadata.category === 'comparisons') {
    score += 2;
    reasons.push('Grammatical contrast pattern detected');
  }

  if (analysis.questionCount > 0 && metadata.category === 'questioning') {
    score += 2;
    reasons.push(`${analysis.questionCount} question(s) found`);
  }

  if (analysis.hasNegation && analysis.questionCount > 0) {
    score += 1;
    reasons.push('Negative question pattern (expressing doubt)');
  }

  // Specific template patterns (enhanced with NLP)
  if (templateId === 'drake') {
    if (analysis.preference || analysis.comparison || analysis.irony) {
      score += 3;
      reasons.push('Strong preference/comparison pattern detected');
    }
    // Detect "used to X, but now Y" pattern (perfect for drake)
    if (
      (analysis.hasPastTense && analysis.hasPresentTense) ||
      /\b(used to|years|before|now|but now|instead)\b/i.test(lower)
    ) {
      score += 4;
      reasons.push('Before/after temporal pattern detected');
    }
  }

  if (templateId === 'db' && /\b(distract|tempt|focus)\b/i.test(lower)) {
    score += 3;
    reasons.push('Distraction pattern detected');
  }

  if (templateId === 'fry') {
    if (analysis.confusion && analysis.question) {
      score += 3;
      reasons.push('Uncertainty question pattern detected');
    }
    if (analysis.hasNegation && /\b(not sure|uncertain)\b/i.test(lower)) {
      score += 2;
      reasons.push('Negative uncertainty expression');
    }
  }

  if (templateId === 'cmm' && analysis.confident) {
    score += 3;
    reasons.push('Strong opinion/hot take detected');
  }

  if (templateId === 'pigeon' && /\b(is this|confus|wrong|mistak)\b/i.test(lower)) {
    score += 3;
    reasons.push('Misidentification pattern detected');
  }

  if (templateId === 'astronaut' && analysis.surprise && analysis.irony) {
    score += 3;
    reasons.push('Ironic revelation pattern detected');
  }

  if (templateId === 'gru' && /\b(plan|expect|turn out|backfire)\b/i.test(lower)) {
    score += 3;
    reasons.push('Failed plan pattern detected');
  }

  if (
    templateId === 'woman-cat' &&
    /\b(yell|argue|angry|confus|don't understand)\b/i.test(lower)
  ) {
    score += 3;
    reasons.push('Argument/confusion pattern detected');
  }

  // Popularity boost (if no specific matches)
  if (score === 0 && metadata.popularity === 'high') {
    score += 0.5;
    reasons.push('Popular template');
  }

  return { score, reasons };
}

/**
 * Suggest templates based on content analysis
 */
export function suggestTemplates(args: SuggestTemplatesArgs): {
  suggestions: TemplateSuggestion[];
  analysis: {
    contentLength: number;
    wordCount: number;
    nlpAnalysis: ReturnType<typeof analyzeContent>;
  };
} {
  const { content, limit } = args;

  // Analyze content with NLP
  const nlpAnalysis = analyzeContent(content);
  const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;

  // Score all templates
  const scored = Object.keys(templateMetadata).map((templateId) => {
    const { score, reasons } = scoreTemplate(templateId, content, nlpAnalysis);
    return {
      templateId,
      score,
      reasons,
    };
  });

  // Sort by score and take top N
  const topSuggestions = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Format suggestions
  const suggestions: TemplateSuggestion[] = topSuggestions.map((s) => {
    const metadata = templateMetadata[s.templateId];
    const template = templates[s.templateId];

    const confidence: 'high' | 'medium' | 'low' =
      s.score >= 5 ? 'high' : s.score >= 2 ? 'medium' : 'low';

    return {
      template: s.templateId,
      name: template.name,
      reason: s.reasons.join('; '),
      confidence,
      usage: metadata.usage,
      slots: template.slots,
      category: metadata.category,
    };
  });

  return {
    suggestions,
    analysis: {
      contentLength: content.length,
      wordCount,
      nlpAnalysis,
    },
  };
}
