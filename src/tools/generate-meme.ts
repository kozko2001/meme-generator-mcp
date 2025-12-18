import { z } from 'zod';
import { buildMemeUrl } from '../utils/memegen.js';
import { getTemplateIds, isValidTemplate } from '../templates/catalog.js';

/**
 * Input schema for generate_meme tool
 */
export const GenerateMemeArgsSchema = z.object({
  template: z.enum(getTemplateIds() as [string, ...string[]]),
  top_text: z.string(),
  bottom_text: z.string(),
});

export type GenerateMemeArgs = z.infer<typeof GenerateMemeArgsSchema>;

/**
 * Tool definition for MCP
 */
export const generateMemeTool = {
  name: 'generate_meme',
  description: `Generate a meme image using memegen.link. 200+ templates available!

Available templates:
• aag: Ancient Aliens Guy
• ackbar: It's A Trap!
• afraid: Afraid to Ask Andy
• agnes: Agnes Harkness Winking
• aint-got-time: Sweet Brown
• ams: Awkward Moment Seal
• ants: Do You Want Ants?
• apcr: Almost Politically Correct Redneck
• astronaut: Always Has Been
• atis: And Then I Said
• away: Life... Finds a Way
• awesome: Socially Awesome Penguin
• awesome-awkward: Socially Awesome Awkward Penguin
• awkward: Socially Awkward Penguin
• awkward-awesome: Socially Awkward Awesome Penguin
• bad: You Should Feel Bad
• badchoice: Milk Was a Bad Choice
• balloon: Running Away Balloon
• bd: Butthurt Dweller
• because: Men in Black
• bender: I'm Going to Build My Own Theme Park
• bihw: But It's Honest Work
• bilbo: Why Shouldn't I Keep It
• biw: Baby Insanity Wolf
• blb: Bad Luck Brian
• boat: I Should Buy a Boat Cat
• bongo: Bongo Cat
• both: Why Not Both?
• box: What's in the box!?
• bs: This is Bull, Shark
• bus: Two Guys on a Bus
• buzz: X, X Everywhere
• cake: Office Space Milton
• captain: I am the Captain Now
• captain-america: Captain America Elevator Fight Dad Joke
• cb: Confession Bear
• cbb: Communist Bugs Bunny
• cbg: Comic Book Guy
• center: What is this, a Center for Ants?!
• ch: Captain Hindsight
• chair: American Chopper Argument
• cheems: Cheems
• chosen: You Were the Chosen One!
• cmm: Change My Mind
• country: What a Country
• crazypills: I Feel Like I'm Taking Crazy Pills
• crow: Get Better Material
• cryingfloor: Crying on Floor
• db: Distracted Boyfriend
• dbg: Expectation vs. Reality
• dg: Distracted Girlfriend
• disastergirl: Disaster Girl
• dodgson: See? Nobody Cares
• doge: Doge
• dragon: What Color Do You Want Your Dragon
• drake: Drakeposting
• drowning: Drowning High Five
• drunk: Drunk Baby
• ds: Daily Struggle
• dsm: Dating Site Murderer
• dwight: Schrute Facts
• elf: You Sit on a Throne of Lies
• elmo: Elmo Choosing Cocaine
• ermg: Ermahgerd
• exit: Left Exit 12 Off Ramp
• fa: Forever Alone
• facepalm: Facepalm
• fbf: Foul Bachelor Frog
• feelsgood: Feels Good
• fetch: Stop Trying to Make Fetch Happen
• fine: This is Fine
• firsttry: First Try!
• fmr: Fuck Me, Right?
• friends: Are You Two Friends?
• fry: Futurama Fry
• fwp: First World Problems
• gandalf: Confused Gandalf
• gb: Galaxy Brain
• gears: You Know What Really Grinds My Gears?
• genie: Genie Lamp
• ggg: Good Guy Greg
• glasses: Peter Parker's Glasses
• gone: And It's Gone
• grave: Grant Gustin Next To Oliver Queen's Grave
• gru: Gru's Plan
• grumpycat: Grumpy Cat
• hagrid: I Should Not Have Said That
• handshake: Epic Handshake
• happening: It's Happening
• harold: Hide the Pain Harold
• headaches: Types of Headaches
• hipster: Hipster Barista
• home: We Have Food at Home
• icanhas: I Can Has Cheezburger?
• imsorry: Oh, I'm Sorry, I Thought This Was America
• inigo: Inigo Montoya
• interesting: The Most Interesting Man in the World
• ive: Jony Ive Redesigns Things
• iw: Insanity Wolf
• jd: Joseph Ducreux
• jetpack: Nothing To Do Here
• jim: Jim Halpert Pointing to Whiteboard
• joker: It's Simple, Kill the Batman
• jw: Probably Not a Good Idea
• keanu: Conspiracy Keanu
• kermit: But That's None of My Business
• khaby-lame: Khaby Lame Shrug
• kk: Karate Kyle
• kombucha: Kombucha Girl
• kramer: Kramer, What's Going On In There?
• leo: Leo Strutting
• light: Everything the Light Touches is Our Kingdom
• live: Do It Live!
• ll: Laughing Lizard
• lrv: Laundry Room Viking
• made: I Made This
• mb: Member Berries
• michael-scott: Michael Scott No God No
• midwit: Midwit
• millers: You Guys Are Getting Paid?
• mini-keanu: Mini Keanu Reeves
• mmm: Minor Mistake Marvin
• money: Shut Up and Take My Money!
• mordor: One Does Not Simply Walk into Mordor
• morpheus: Matrix Morpheus
• mouth: Woman Holding Dog's Mouth
• mw: I Guarantee It
• nails: Guy Hammering Nails Into Sand
• nice: So I Got That Goin' For Me, Which is Nice
• noah: What the Hell is This?
• noidea: I Have No Idea What I'm Doing
• ntot: No Take, Only Throw
• oag: Overly Attached Girlfriend
• officespace: That Would Be Great
• older: An Older Code Sir, But It Checks Out
• oprah: Oprah You Get a Car
• panik-kalm-panik: Panik Kalm Panik
• patrick: Push it somewhere else Patrick
• perfection: Perfection
• persian: Persian Cat Room Guardian
• philosoraptor: Philosoraptor
• pigeon: Is This a Pigeon?
• pooh: Tuxedo Winnie the Pooh
• pool: Mother Ignoring Kid Drowning In A Pool
• prop3: Too Confusing, Too Extreme
• ptj: Phoebe Teaching Joey
• puffin: Unpopular opinion puffin
• red: Oh, Is That What We're Going to Do Today?
• regret: I Immediately Regret This Decision!
• remembers: Pepperidge Farm Remembers
• reveal: Scooby Doo Reveal
• right: Anakin and Padme Change the World For the Better
• rollsafe: Roll Safe
• sad-biden: Sad Joe Biden
• sad-boehner: Sad John Boehner
• sad-bush: Sad George Bush
• sad-clinton: Sad Bill Clinton
• sad-obama: Sad Barack Obama
• sadfrog: Feels Bad Man
• saltbae: Salt Bae
• same: They're The Same Picture
• sarcasticbear: Sarcastic Bear
• say: Say the Line, Bart!
• sb: Scumbag Brain
• scc: Sudden Clarity Clarence
• seagull: Inhaling Seagull
• sf: Sealed Fate
• sk: Skeptical Third World Kid
• ski: Super Cool Ski Instructor
• slap: Will Smith Slapping Chris Rock
• snek: Skeptical Snake
• soa: Seal of Approval
• sohappy: I Would Be So Happy
• sohot: So Hot Right Now
• soup-nazi: No Soup for You
• sparta: This is Sparta!
• spiderman: Spider-Man Pointing at Spider-Man
• spirit: Fake Spirit Halloween Costume
• spongebob: Mocking Spongebob
• ss: Scumbag Steve
• stew: Baby, You've Got a Stew Going
• stonks: Stonks
• stop: Stop It Patrick You're Scaring Him
• stop-it: Stop It, Get Some Help
• success: Success Kid
• tenguy: 10 Guy
• toohigh: The Rent Is Too Damn High
• touch: Principal Skinner
• tried: At Least You Tried
• trump: Donald Trump
• ugandanknuck: Ugandan Knuckles
• vince: Vince McMahon Reaction
• wallet: Patrick Star's Wallet
• waygd: What Are Ya Gonna Do?
• wddth: We Don't Do That Here
• whatyear: What Year Is It?
• winter: Winter is coming
• wishes: Genie Rules
• wkh: Who Killed Hannibal?
• woman-cat: Woman Yelling at a Cat
• wonka: Condescending Wonka
• worst: The Worst Day Of Your Life So Far
• xy: X all the Y
• yallgot: Y'all Got Any More of Them
• yodawg: Xzibit Yo Dawg
• yuno: Y U NO Guy
• zero-wing: All Your Base Are Belong to Us

Browse templates at https://memegen.link/templates/`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      template: {
        type: 'string' as const,
        enum: getTemplateIds(),
        description: 'The meme template to use',
      },
      top_text: {
        type: 'string' as const,
        description: 'Top/first text panel',
      },
      bottom_text: {
        type: 'string' as const,
        description: 'Bottom/second text panel (can be empty for some templates)',
      },
    },
    required: ['template', 'top_text', 'bottom_text'] as const,
  },
};

/**
 * Fetch image and convert to base64
 */
async function fetchImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

/**
 * Handler for generate_meme tool
 */
export async function handleGenerateMeme(
  args: GenerateMemeArgs
): Promise<{ url: string; base64Image: string }> {
  const { template, top_text, bottom_text } = args;

  if (!isValidTemplate(template)) {
    throw new Error(`Invalid template: ${template}`);
  }

  const url = buildMemeUrl(template, top_text, bottom_text);
  const base64Image = await fetchImageAsBase64(url);

  return { url, base64Image };
}
