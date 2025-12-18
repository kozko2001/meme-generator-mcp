/**
 * Meme template catalog for Release 1
 *
 * Each template includes metadata to help the LLM choose the right one
 */

export interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  example: string;
  slots: number;
}

export const templates: Record<string, MemeTemplate> = {
  drake: {
    id: 'drake',
    name: 'Drake Hotline Bling',
    description: 'Rejecting one thing in favor of another. Top panel shows rejection (hand up), bottom panel shows approval (pointing).',
    example: 'Top: "Using print debugging" / Bottom: "Using a proper debugger"',
    slots: 2,
  },
  db: {
    id: 'db',
    name: 'Distracted Boyfriend',
    description: 'Being tempted or distracted by something new while ignoring the current thing. Shows someone looking at a new option while their current choice looks on disapprovingly.',
    example: 'Top: "Current framework" / Bottom: "Shiny new framework"',
    slots: 2,
  },
  cmm: {
    id: 'cmm',
    name: 'Change My Mind',
    description: 'Stating a hot take, controversial opinion, or bold claim. Person sitting at table with a sign.',
    example: 'Top: "Tabs are better than spaces" / Bottom: "" (usually empty)',
    slots: 2,
  },
  pigeon: {
    id: 'pigeon',
    name: 'Is This a Pigeon?',
    description: 'Completely misidentifying or misunderstanding something obvious. Character pointing at something and asking if it\'s something else entirely.',
    example: 'Top: "A bug" / Bottom: "Is this a feature?"',
    slots: 2,
  },
};

/**
 * Get template by ID
 */
export function getTemplate(id: string): MemeTemplate | undefined {
  return templates[id];
}

/**
 * Get all template IDs
 */
export function getTemplateIds(): string[] {
  return Object.keys(templates);
}

/**
 * Validate if a template ID exists
 */
export function isValidTemplate(id: string): boolean {
  return id in templates;
}
