import { z } from 'zod';
import * as cheerio from 'cheerio';

/**
 * Input schema for fetch_content tool
 */
export const fetchContentInputSchema = z.object({
  url: z.string().url(),
});

export type FetchContentArgs = z.infer<typeof fetchContentInputSchema>;

/**
 * Tool definition for MCP
 */
export const fetchContentSchema = {
  name: 'fetch_url_content',
  description: `Fetch and extract text content from a URL to help create memes.

This tool downloads a web page and extracts readable text content using proper HTML parsing (cheerio). Use this when:
- User provides a news article, blog post, or web page URL
- You need to extract content to create memes from
- User says "make a meme from this article/post/page"

The tool returns:
- Original URL
- Extracted plain text (first 5000 characters)
- Page title (if available)
- Word count
- Basic metadata

Features:
- Properly removes scripts, styles, nav, footer elements
- Extracts main content intelligently
- Handles HTML entities correctly
- Preserves sentence structure

After fetching content, analyze it yourself to:
1. Identify the funny/meme-worthy parts
2. Choose appropriate template(s)
3. Generate memes using generate_meme tool

Example flow:
User: "Make a meme from https://example.com/article"
1. Call fetch_url_content with the URL
2. Analyze the returned text
3. Extract key points or funny moments
4. Call generate_meme with appropriate template`,
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to fetch content from (must be a valid HTTP/HTTPS URL)',
      },
    },
    required: ['url'],
  },
};

/**
 * Extract text content from HTML using cheerio
 * Intelligently extracts main content while removing boilerplate
 */
function extractTextFromHtml(html: string): { text: string; title?: string } {
  const $ = cheerio.load(html);

  // Remove elements that aren't content
  $('script').remove();
  $('style').remove();
  $('noscript').remove();
  $('iframe').remove();
  $('nav').remove();
  $('header').remove();
  $('footer').remove();
  $('aside').remove();
  $('.ad').remove();
  $('.advertisement').remove();
  $('.social-share').remove();
  $('.comments').remove();

  // Try to find the main content
  // Priority order: article, main, body
  let contentElement = $('article').first();
  if (contentElement.length === 0) {
    contentElement = $('main').first();
  }
  if (contentElement.length === 0) {
    contentElement = $('body');
  }

  // Extract text
  const text = contentElement
    .text()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Extract title
  const title = $('title').text().trim() || $('h1').first().text().trim() || undefined;

  return { text, title };
}

/**
 * Fetch content from URL and extract text
 */
export async function fetchUrlContent(args: FetchContentArgs): Promise<{
  url: string;
  title?: string;
  content: string;
  wordCount: number;
  charCount: number;
  truncated: boolean;
}> {
  const { url } = args;

  try {
    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MemeGeneratorMCP/1.0; +https://github.com/yourusername/meme-generator-mcp)',
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error(
        `Unsupported content type: ${contentType}. Only HTML and plain text are supported.`
      );
    }

    const html = await response.text();
    const { text, title } = extractTextFromHtml(html);

    // Limit to first 5000 characters to keep responses manageable
    const maxChars = 5000;
    const truncated = text.length > maxChars;
    const content = truncated ? text.slice(0, maxChars) : text;

    const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;

    return {
      url,
      title,
      content,
      wordCount,
      charCount: content.length,
      truncated,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    throw new Error('Failed to fetch URL: Unknown error');
  }
}
