/**
 * URL builder for memegen.link API
 *
 * memegen.link uses a specific encoding scheme for special characters in text:
 * - Spaces → underscores or dashes
 * - ? → ~q
 * - % → ~p
 * - # → ~h
 * - / → ~s
 * - \ → ~b
 * - _ (literal) → __
 * - - (literal) → --
 * - "" (empty) → _
 */

/**
 * Get the memegen base URL from environment or use default
 */
function getMemegenBaseUrl(): string {
  const customUrl = process.env.MEMEGEN_URL;
  if (customUrl) {
    // Remove trailing slash if present
    return customUrl.replace(/\/$/, '');
  }
  return 'https://api.memegen.link/images';
}

/**
 * Encode text for memegen.link URL format
 */
export function encodeMemeText(text: string): string {
  if (!text || text.trim() === '') {
    return '_';
  }

  return text
    // First, escape literal underscores and dashes
    .replace(/_/g, '__')
    .replace(/-/g, '--')
    // Then encode special characters
    .replace(/\?/g, '~q')
    .replace(/%/g, '~p')
    .replace(/#/g, '~h')
    .replace(/\//g, '~s')
    .replace(/\\/g, '~b')
    // Finally, replace spaces with underscores
    .replace(/ /g, '_');
}

/**
 * Build a memegen.link image URL
 */
export function buildMemeUrl(template: string, textLines: string[]): string {
  const encodedLines = textLines.map(encodeMemeText);
  const baseUrl = getMemegenBaseUrl();

  return `${baseUrl}/${template}/${encodedLines.join('/')}.png`;
}
