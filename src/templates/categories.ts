import { TemplateCategory } from './metadata.js';

export interface CategoryInfo {
  id: TemplateCategory;
  name: string;
  description: string;
  templates: string[];
}

export const categories: Record<TemplateCategory, CategoryInfo> = {
  'reactions': {
    id: 'reactions',
    name: 'Reactions & Emotions',
    description: 'Express feelings, surprise, shock, happiness, disappointment, satisfaction, or other emotional responses',
    templates: [
      'fine', 'harold', 'feelsgood', 'sadfrog', 'grumpycat', 'happening',
      'facepalm', 'regret', 'tried', 'soa', 'astronaut', 'scc',
      'whatyear', 'gandalf', 'chosen', 'cryingfloor', 'worst', 'badchoice',
      'disastergirl', 'ams', 'cheems', 'crow', 'kombucha', 'll',
      'money', 'sohappy', 'sohot', 'seagull', 'sf', 'stop-it',
      'ermg', 'firsttry', 'gone', 'live', 'nice'
    ],
  },
  'comparisons': {
    id: 'comparisons',
    name: 'Comparisons & Choices',
    description: 'Compare options, show preferences, A vs B situations, distractions, or things that are actually the same',
    templates: [
      'drake', 'db', 'dg', 'pooh', 'glasses', 'both', 'dbg', 'same',
      'spiderman', 'exit', 'vince', 'ds', 'balloon', 'handshake',
      'friends', 'home', 'midwit', 'oprah', 'persian', 'buzz',
      'mini-keanu', 'slap', 'khaby-lame', 'leo', 'saltbae', 'stonks',
      'woman-cat', 'ugandanknuck'
    ],
  },
  'social': {
    id: 'social',
    name: 'Social Situations',
    description: 'Awkward moments, social anxiety, interactions, relationships, being a good or bad person',
    templates: [
      'awkward', 'awesome', 'awesome-awkward', 'awkward-awesome', 'ggg', 'ss',
      'oag', 'dsm', 'afraid', 'atis', 'ch', 'hipster', 'lrv',
      'sarcasticbear', 'sb', 'bd', 'fbf', 'kk', 'mmm', 'puffin',
      'cb', 'drunk', 'tenguy', 'fa'
    ],
  },
  'questioning': {
    id: 'questioning',
    name: 'Questions & Uncertainty',
    description: 'Doubt, confusion, philosophical questions, skepticism, not understanding, or misidentifying things',
    templates: [
      'fry', 'keanu', 'philosoraptor', 'noidea', 'sk', 'wonka',
      'snek', 'pigeon', 'rollsafe', 'inigo', 'touch', 'box',
      'crazypills', 'waygd', 'toohigh', 'yuno', 'joker', 'wishes'
    ],
  },
  'success-fail': {
    id: 'success-fail',
    name: 'Success & Failure',
    description: 'Achievements, victories, bad luck, mistakes, things going right or wrong',
    templates: [
      'success', 'blb', 'mw', 'biw', 'iw', 'bihw', 'boat', 'gone',
      'icanhas', 'jetpack', 'aag', 'away', 'center', 'country',
      'bender', 'genie'
    ],
  },
  'statements': {
    id: 'statements',
    name: 'Bold Statements & Opinions',
    description: 'Hot takes, opinions, declarations, emphatic statements, warnings, or corrections',
    templates: [
      'cmm', 'sparta', 'mordor', 'morpheus', 'dwight', 'ackbar',
      'bad', 'cake', 'captain', 'fetch', 'imsorry', 'fmr',
      'elf', 'soup-nazi', 'headaches'
    ],
  },
  'narrative': {
    id: 'narrative',
    name: 'Stories & Dialogue',
    description: 'Multi-panel stories, conversations, arguments, plans that backfire, or sequential narratives',
    templates: [
      'gru', 'chair', 'perfection', 'reveal', 'gb', 'panik-kalm-panik',
      'stop', 'wallet', 'ptj', 'captain-america', 'say', 'red',
      'wkh', 'drowning', 'grave', 'pool', 'mouth', 'nails',
      'ntot', 'noah', 'millers', 'elmo'
    ],
  },
  'meta': {
    id: 'meta',
    name: 'Meta & Self-Referential',
    description: 'Memes about memes, internet culture, self-aware humor, or commenting on the meme format itself',
    templates: [
      'older', 'made', 'xy', 'doge', 'remembers', 'jd', 'yodawg',
      'yallgot', 'cbg', 'ive', 'mb', 'dodgson'
    ],
  },
  'characters': {
    id: 'characters',
    name: 'Character-Specific',
    description: 'Templates featuring specific people, politicians, TV/movie characters, or internet personalities',
    templates: [
      'trump', 'sad-biden', 'sad-obama', 'sad-bush', 'sad-clinton', 'sad-boehner',
      'hagrid', 'jim', 'michael-scott', 'kramer', 'officespace', 'interesting',
      'jw', 'bilbo', 'right', 'light', 'stew', 'because',
      'bongo', 'bs', 'bus', 'cbb', 'dragon', 'fwp',
      'gears', 'kermit', 'patrick', 'spongebob', 'ski', 'winter',
      'agnes', 'aint-got-time', 'ants', 'apcr', 'prop3', 'spirit',
      'zero-wing', 'wddth'
    ],
  },
};

// Helper function to get category for a template
export function getCategoryForTemplate(templateId: string): CategoryInfo | undefined {
  for (const category of Object.values(categories)) {
    if (category.templates.includes(templateId)) {
      return category;
    }
  }
  return undefined;
}

// Helper function to validate all templates are categorized
export function validateCategories(allTemplateIds: string[]): { valid: boolean; missing: string[]; extra: string[] } {
  const categorizedTemplates = new Set<string>();

  for (const category of Object.values(categories)) {
    for (const templateId of category.templates) {
      categorizedTemplates.add(templateId);
    }
  }

  const allTemplateSet = new Set(allTemplateIds);
  const missing = allTemplateIds.filter(id => !categorizedTemplates.has(id));
  const extra = Array.from(categorizedTemplates).filter(id => !allTemplateSet.has(id));

  return {
    valid: missing.length === 0 && extra.length === 0,
    missing,
    extra,
  };
}
