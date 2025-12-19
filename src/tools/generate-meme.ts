import { z } from 'zod';
import { buildMemeUrl } from '../utils/memegen.js';
import { getTemplateIds, isValidTemplate, templates } from '../templates/catalog.js';

/**
 * Input schema for generate_meme tool
 */
export const GenerateMemeArgsSchema = z.object({
  template: z.enum(getTemplateIds() as [string, ...string[]]),
  text_lines: z.array(z.string()).min(1).max(8),
});

export type GenerateMemeArgs = z.infer<typeof GenerateMemeArgsSchema>;

/**
 * Tool definition for MCP
 */
export const generateMemeTool = {
  name: 'generate_meme',
  description: `Generate a meme image using memegen.link. 200+ templates available! Choose the template that best matches your humor. Templates are grouped by number of text lines needed:

1-line templates (6 templates):
• cmm: Change My Mind
  Example: ["Top Line","Bottom Line"]
• dragon: What Color Do You Want Your Dragon
  Example: ["OK I want a boyfriend"]
• headaches: Types of Headaches
  Example: ["Breaking Production"]
• prop3: Too Confusing, Too Extreme
  Example: ["Zipper Merging"]
• wishes: Genie Rules
  Example: ["I want to divide by zero"]
• zero-wing: All Your Base Are Belong to Us
  Example: ["all your base are belong to us"]

2-lines templates (165 templates):
• aag: Ancient Aliens Guy
  Example: ["","aliens"]
• ackbar: It's A Trap!
  Example: ["","it's a trap!"]
• afraid: Afraid to Ask Andy
  Example: ["i don't know what this meme is for","and at this point i'm too afraid to ask"]
• agnes: Agnes Harkness Winking
  Example: ["","i have read and agree to the terms and conditions"]
• aint-got-time: Sweet Brown
  Example: ["memes?","ain't nobody got time fo' that"]
• ams: Awkward Moment Seal
  Example: ["when you're watching a movie","and your parents walk in at the sex scene"]
• ants: Do You Want Ants?
  Example: ["do you want ants?","because that's how you get ants"]
• apcr: Almost Politically Correct Redneck
  Example: ["I supported my sister's abortion","Still would have been cool to be a dad"]
• atis: And Then I Said
  Example: ["and then i said","the exam will only contain what we've covered in lectures"]
• away: Life... Finds a Way
  Example: ["life...","finds a way"]
• awesome: Socially Awesome Penguin
  Example: ["say a word wrong","create hilarious inside joke"]
• awesome-awkward: Socially Awesome Awkward Penguin
  Example: ["first day at new job","spill coffee on bossman"]
• awkward: Socially Awkward Penguin
  Example: ["start telling joke","forget punchline"]
• awkward-awesome: Socially Awkward Awesome Penguin
  Example: ["trip guy on the street","he was running with a stolen purse"]
• bad: You Should Feel Bad
  Example: ["your meme is bad","and you should feel bad"]
• badchoice: Milk Was a Bad Choice
  Example: ["milk","was a bad choice"]
• bd: Butthurt Dweller
  Example: ["can't workout","don't want to get too buff"]
• because: Men in Black
  Example: ["Just because you see a Black man driving in a nice car... does not mean it's stolen.","...I stole that one, but not 'cause I'm Black!"]
• bender: I'm Going to Build My Own Theme Park
  Example: ["i'm going to build my own theme park","with blackjack and hookers"]
• bihw: But It's Honest Work
  Example: ["it ain't much","but it's honest work"]
• bilbo: Why Shouldn't I Keep It
  Example: ["After all... why not?","Why shouldn't I keep it?"]
• biw: Baby Insanity Wolf
  Example: ["gets iced coffee","in the winter"]
• blb: Bad Luck Brian
  Example: ["falls asleep in class","has a wet dream"]
• boat: I Should Buy a Boat Cat
  Example: ["","i should buy a boat"]
• bongo: Bongo Cat
  Example: ["Any sound when you're trying to sleep","Max volume alarm when you have to wake up"]
• both: Why Not Both?
  Example: ["hard or soft tacos","why not both?"]
• box: What's in the box!?
  Example: ["","What's in the box!?"]
• bs: This is Bull, Shark
  Example: ["what a surprise...","you caught me again"]
• bus: Two Guys on a Bus
  Example: ["Postseason","Preseason"]
• buzz: X, X Everywhere
  Example: ["Top Line","Bottom Line"]
• cake: Office Space Milton
  Example: ["","I was told there would be cake"]
• captain: I am the Captain Now
  Example: ["look at me","i am the captain now"]
• cb: Confession Bear
  Example: ["i stole","the pic-i-nic basket"]
• cbb: Communist Bugs Bunny
  Example: ["","our memes!"]
• cbg: Comic Book Guy
  Example: ["","worst thing ever!"]
• center: What is this, a Center for Ants?!
  Example: ["what is this","a center for ants"]
• ch: Captain Hindsight
  Example: ["if you wanted to avoid the friend zone","you should have made your intentions known from the start"]
• cheems: Cheems
  Example: ["it's a good time to sleep","nothing will go wrong after this"]
• chosen: You Were the Chosen One!
  Example: ["you were the chosen one!"]
• country: What a Country
  Example: ["Inflammable means flammable?","What a country!"]
• crazypills: I Feel Like I'm Taking Crazy Pills
  Example: ["","i feel like i'm taking crazy pills"]
• crow: Get Better Material
  Example: ["Caw Caw Caw","Caw Caw Caw Caw Caw Caw"]
• cryingfloor: Crying on Floor
  Example: ["it's okay","lets just reschedule drinking"]
• dbg: Expectation vs. Reality
  Example: ["Clicking the 'X' on a mobile ad","The 'X' is part of the ad"]
• disastergirl: Disaster Girl
  Example: ["","just as I planned..."]
• dodgson: See? Nobody Cares
  Example: ["we've got dodgson here!","see? nobody cares"]
• doge: Doge
  Example: ["such meme","very skill"]
• drake: Drakeposting
  Example: ["Top Line","Bottom Line"]
• drunk: Drunk Baby
  Example: ["Walk in a straight line?","Officer, I can barely stand"]
• dsm: Dating Site Murderer
  Example: ["they will never find your body","as attractive as i do"]
• dwight: Schrute Facts
  Example: ["love is all you need?","false. you need water and rations."]
• elf: You Sit on a Throne of Lies
  Example: ["","you sit on a throne of lies"]
• ermg: Ermahgerd
  Example: ["ermahgerd","memes"]
• fa: Forever Alone
  Example: ["forever","alone"]
• facepalm: Facepalm
  Example: ["","I can't even"]
• fbf: Foul Bachelor Frog
  Example: ["paper towel","the plate that cleans up after itself"]
• feelsgood: Feels Good
  Example: ["","feels good"]
• fetch: Stop Trying to Make Fetch Happen
  Example: ["stop trying to make fetch happen","it's not going to happen"]
• fine: This is Fine
  Example: ["","this is fine"]
• firsttry: First Try!
  Example: ["","first try!"]
• fmr: Fuck Me, Right?
  Example: ["","fuck me, right?"]
• fry: Futurama Fry
  Example: ["not sure if trolling","or just stupid"]
• fwp: First World Problems
  Example: ["someone on the internet","disagrees with me"]
• gandalf: Confused Gandalf
  Example: ["","I have no memory of this place"]
• gears: You Know What Really Grinds My Gears?
  Example: ["you know what really grinds my gears?","when people post images of cogs that don't mesh"]
• genie: Genie Lamp
  Example: ["phenomenal cosmic power","itty bitty living space"]
• ggg: Good Guy Greg
  Example: ["sleeps on your couch","makes breakfast"]
• glasses: Peter Parker's Glasses
  Example: ["Virginity is cool, stay pure","I am utterly incapable of getting laid"]
• gone: And It's Gone
  Example: ["we'll just invest that money","...aaaand it's gone"]
• grumpycat: Grumpy Cat
  Example: ["i hope that what does not kill you","tries again"]
• hagrid: I Should Not Have Said That
  Example: ["","i should not have said that"]
• happening: It's Happening
  Example: ["","it's happening"]
• harold: Hide the Pain Harold
  Example: ["when the boss sees","your meme tab"]
• hipster: Hipster Barista
  Example: ["puts coffee deal on Groupon","rolls eyes when you actually use it"]
• icanhas: I Can Has Cheezburger?
  Example: ["i can has","this meme?"]
• imsorry: Oh, I'm Sorry, I Thought This Was America
  Example: ["oh, i'm sorry","i thought this was america"]
• inigo: Inigo Montoya
  Example: ["you keep using that word","i do not think it means what you think it means"]
• interesting: The Most Interesting Man in the World
  Example: ["I don't often drink beer","so you shouldn't value my opinion"]
• ive: Jony Ive Redesigns Things
  Example: ["we think","you'll love it"]
• iw: Insanity Wolf
  Example: ["does testing","in production"]
• jd: Joseph Ducreux
  Example: ["disregard females","acquire currency"]
• jetpack: Nothing To Do Here
  Example: ["nothing to do here"]
• jim: Jim Halpert Pointing to Whiteboard
  Example: ["It's OK to like trashy shows and movies","If it makes you happy then it's not a waste of time"]
• joker: It's Simple, Kill the Batman
  Example: ["it's simple","kill the batman"]
• jw: Probably Not a Good Idea
  Example: ["you just went and made a new dinosaur?","probably not a good idea"]
• keanu: Conspiracy Keanu
  Example: ["what if the CIA invented dinosaurs","to discourage time travel?"]
• kermit: But That's None of My Business
  Example: ["","but that's none of my business"]
• khaby-lame: Khaby Lame Shrug
  Example: ["Bad mood?","Laugh at memes"]
• kk: Karate Kyle
  Example: ["they broke my pencils","i broke their neck"]
• kombucha: Kombucha Girl
  Example: ["Trying a thing.","Trying a thing again."]
• kramer: Kramer, What's Going On In There?
  Example: ["Kramer, what's going on in there?","It's a Chicken Roaster sign, right across from my window."]
• leo: Leo Strutting
  Example: ["I have no idea","what I am doing"]
• light: Everything the Light Touches is Our Kingdom
  Example: ["What about that shadowy place?","That's beyond our borders. You must never go there."]
• live: Do It Live!
  Example: ["","do it live!"]
• ll: Laughing Lizard
  Example: ["","hhhehehe"]
• lrv: Laundry Room Viking
  Example: ["do the laundry they said","it will be fun they said"]
• mb: Member Berries
  Example: ["'member","star wars?"]
• michael-scott: Michael Scott No God No
  Example: ["no, god! no god please no!","noooooooooooooooo!"]
• mini-keanu: Mini Keanu Reeves
  Example: ["me waiting for mom to stop talking on the phone","so I can tell her my Pokemon evolved"]
• mmm: Minor Mistake Marvin
  Example: ["Puts ice cream back","Into the refrigerator"]
• money: Shut Up and Take My Money!
  Example: ["shut up and","take my money!"]
• mordor: One Does Not Simply Walk into Mordor
  Example: ["one does not simply","walk into mordor"]
• morpheus: Matrix Morpheus
  Example: ["what if I told you that","reality was an illusion?"]
• mw: I Guarantee It
  Example: ["you're gonna like the way you look","i guarantee it"]
• nice: So I Got That Goin' For Me, Which is Nice
  Example: ["","so i got that goin' for me, which is nice"]
• noidea: I Have No Idea What I'm Doing
  Example: ["i have no idea","what i'm doing"]
• oag: Overly Attached Girlfriend
  Example: ["i know you received my email","because i checked your inbox"]
• officespace: That Would Be Great
  Example: ["yeah...","that'd be great"]
• older: An Older Code Sir, But It Checks Out
  Example: ["it's an older meme sir","but it checks out"]
• oprah: Oprah You Get a Car
  Example: ["Top Line","Bottom Line"]
• patrick: Push it somewhere else Patrick
  Example: ["why don't we take all the memes","and put them on memegen"]
• persian: Persian Cat Room Guardian
  Example: ["when you wake up from a nap","and your mom starts yelling at you"]
• philosoraptor: Philosoraptor
  Example: ["if the earth is the third planet from the sun","then isn't every country a third world country?"]
• pooh: Tuxedo Winnie the Pooh
  Example: ["Burger King","The Monarch of Hamburg"]
• puffin: Unpopular opinion puffin
  Example: ["I don't find Mitch Hedberg","all the funny"]
• red: Oh, Is That What We're Going to Do Today?
  Example: ["oh, is that what we're going to do today?","we're going to fight?"]
• regret: I Immediately Regret This Decision!
  Example: ["","i immediately regret this decision"]
• remembers: Pepperidge Farm Remembers
  Example: ["remember this meme?","pepperidge farm remembers"]
• rollsafe: Roll Safe
  Example: ["Top Line","Bottom Line"]
• sad-biden: Sad Joe Biden
  Example: ["sad joe biden","doesn't think you'll vote"]
• sad-boehner: Sad John Boehner
  Example: ["sad john boehner","doesn't think you'll vote"]
• sad-bush: Sad George Bush
  Example: ["sad george bush","doesn't think you'll vote"]
• sad-clinton: Sad Bill Clinton
  Example: ["sad bill clinton","doesn't think you'll vote"]
• sad-obama: Sad Barack Obama
  Example: ["sad barack obama","doesn't think you'll vote"]
• sadfrog: Feels Bad Man
  Example: ["Top Line","Bottom Line"]
• saltbae: Salt Bae
  Example: ["","pours salt on it"]
• sarcasticbear: Sarcastic Bear
  Example: ["i'm so sorry","i haven't memorized the internet"]
• say: Say the Line, Bart!
  Example: ["Say the line, Senior Engineer!","It depends."]
• sb: Scumbag Brain
  Example: ["remembers the face","but not the name"]
• scc: Sudden Clarity Clarence
  Example: ["oh my god","those weren't listerine breath strips"]
• seagull: Inhaling Seagull
  Example: ["some","BODY ONCE TOLD ME THE THE WORLD WAS GONNA ROLL ME!!"]
• sf: Sealed Fate
  Example: ["i accidentally used a swear word","and i know my mom heard it from the other room"]
• sk: Skeptical Third World Kid
  Example: ["you finished your plate","because i was starving?"]
• ski: Super Cool Ski Instructor
  Example: ["","you're gonna have a bad time"]
• slap: Will Smith Slapping Chris Rock
  Example: ["Me Trying to Enjoy the Weekend","Monday"]
• snek: Skeptical Snake
  Example: ["when you already checked that one leaf","and it starts moving"]
• soa: Seal of Approval
  Example: ["first wipe","clean toiletpaper"]
• sohappy: I Would Be So Happy
  Example: ["if i could use this meme","i would be so happy"]
• sohot: So Hot Right Now
  Example: ["this meme is","so hot right now"]
• soup-nazi: No Soup for You
  Example: ["no soup for you!"]
• sparta: This is Sparta!
  Example: ["this. is.","sparta!"]
• spiderman: Spider-Man Pointing at Spider-Man
  Example: ["me pointing at you","you pointing at me"]
• spongebob: Mocking Spongebob
  Example: ["BF: I don't even know her like that","Me: i DoN'T eVeN KnOw HeR lIkE tHaT"]
• ss: Scumbag Steve
  Example: ["needs a place to crash","never leaves"]
• stew: Baby, You've Got a Stew Going
  Example: ["","baby, you've got a stew going!"]
• stonks: Stonks
  Example: ["","stonks"]
• stop-it: Stop It, Get Some Help
  Example: ["stop it","get some help"]
• success: Success Kid
  Example: ["don't know a question on the test","answer is in another question"]
• tenguy: 10 Guy
  Example: ["can't read the words on the menu","turns down the radio"]
• toohigh: The Rent Is Too Damn High
  Example: ["the rent is","too damn high"]
• touch: Principal Skinner
  Example: ["Am I so out of touch?","No, it's the children who are wrong."]
• tried: At Least You Tried
  Example: ["at least","you tried"]
• trump: Donald Trump
  Example: ["this is the best meme in the history of memes","maybe ever"]
• ugandanknuck: Ugandan Knuckles
  Example: ["","do u know de wey?"]
• waygd: What Are Ya Gonna Do?
  Example: ["yeah...","what are ya gonna do?"]
• wddth: We Don't Do That Here
  Example: ["when someone calls your phone without warning","We don't do that here."]
• whatyear: What Year Is It?
  Example: ["","what year is it?"]
• winter: Winter is coming
  Example: ["prepare yourself","winter is coming"]
• woman-cat: Woman Yelling at a Cat
  Example: ["Mom telling me how useless I am","12 year old me playing Minecraft"]
• wonka: Condescending Wonka
  Example: ["oh, you just graduated?","you must know everything"]
• worst: The Worst Day Of Your Life So Far
  Example: ["This is the worst day of my life.","This is the worst day of your life so far."]
• xy: X all the Y
  Example: ["all the things!!!"]
• yallgot: Y'all Got Any More of Them
  Example: ["y'all got any more of them","memes"]
• yodawg: Xzibit Yo Dawg
  Example: ["yo dawg","i heard you like memes"]
• yuno: Y U NO Guy
  Example: ["y u no","use this meme!?"]

3-lines templates (21 templates):
• balloon: Running Away Balloon
  Example: ["Opportunities","Opportunities","Shyness"]
• captain-america: Captain America Elevator Fight Dad Joke
  Example: ["Have you ever eaten a clock?","No, why?","It's time consuming."]
• db: Distracted Boyfriend
  Example: ["Socialism","The Youth","Capitalism"]
• dg: Distracted Girlfriend
  Example: ["Socialism","The Youth","Capitalism"]
• drowning: Drowning High Five
  Example: ["Me Asking for Help","Online Commenter","I'm having that problem too."]
• ds: Daily Struggle
  Example: ["The dress is black and blue.","The dress is gold and white."]
• exit: Left Exit 12 Off Ramp
  Example: ["The Pins","The Gutter","Bowling Ball"]
• friends: Are You Two Friends?
  Example: ["Progressives","Republicans","Libertarians"]
• grave: Grant Gustin Next To Oliver Queen's Grave
  Example: ["Here lies the last bit of human decency","Society","Social Media"]
• handshake: Epic Handshake
  Example: ["left","right","center"]
• home: We Have Food at Home
  Example: ["Me: Can we stop and get food?","Mom: We have food at home.","Food at home:"]
• midwit: Midwit
  Example: ["if it's good I do it","NOOOOO you have to have complex reasons for what you're doing. what is the point. what is your goal.","if it's good I do it"]
• mouth: Woman Holding Dog's Mouth
  Example: ["Sales Team presenting the solution in PowerPoint","Excited Customer","Engineering Team knowing the solution is not technically possible"]
• nails: Guy Hammering Nails Into Sand
  Example: ["Humanity","Language","The inherently indescribably nature of the universe"]
• ntot: No Take, Only Throw
  Example: ["Pls throw??","NO TAKE!!","ONLY THROW"]
• panik-kalm-panik: Panik Kalm Panik
  Example: ["You hear a sound downstairs","It's just a cat","You don't have a cat"]
• pigeon: Is This a Pigeon?
  Example: ["Top Line","Bottom Line"]
• pool: Mother Ignoring Kid Drowning In A Pool
  Example: ["Posts in Hot","Posts in New","Redditors"]
• same: They're The Same Picture
  Example: ["π","3","The Bible"]
• vince: Vince McMahon Reaction
  Example: ["2-Day Delivery","Overnight Shipping","Shopping at the Store"]
• wkh: Who Killed Hannibal?
  Example: ["Twin Towers","George Bush","Why would Al-Qaeda do this?"]

4-lines templates (6 templates):
• astronaut: Always Has Been
  Example: ["Top Line","Bottom Line"]
• gb: Galaxy Brain
  Example: ["Who","Whom","Whom'st","Whomst'd"]
• gru: Gru's Plan
  Example: ["Learn how to make memes.","Make a meme.","No one likes it.","No one likes it."]
• millers: You Guys Are Getting Paid?
  Example: ["","You are making 500 thousand dollars and you were only gonna pay me 30?","You're getting 30 grand? I'm getting a thousand!","You guys are getting paid?"]
• noah: What the Hell is This?
  Example: ["Street","Road","Stroad","What the hell is this?"]
• reveal: Scooby Doo Reveal
  Example: ["Villain","Let's see who you really are...","Protagonist","I knew it!"]

5-lines templates (4 templates):
• elmo: Elmo Choosing Cocaine
  Example: ["Historical Accuracy","History Channel","Aliens","Historical Accuracy"]
• made: I Made This
  Example: ["The Internet","Everyone","I made this.","You made this?","I made this."]
• right: Anakin and Padme Change the World For the Better
  Example: ["Senior Developer","Junior Developer","Put it in the backlog.","So we can fix it later, right?","So we can fix it later, right?"]
• spirit: Fake Spirit Halloween Costume
  Example: ["My Dad","Includes:","- Nothing","- Nothing","- Nothing"]

6-lines templates (3 templates):
• chair: American Chopper Argument
  Example: ["Let's expand safety nets","Socialism never works!","Scandinavia is socialist and they're doing great!","They're not socialist. They're capitalist with strong welfare policies!","Then let's adopt those!","No that's socialism!!"]
• perfection: Perfection
  Example: ["Sebastian Shaw","I prefer the real Darth Vader.","Hayden Christensen","I said, the real Darth Vader.","Jake Lloyd","Perfection."]
• stop: Stop It Patrick You're Scaring Him
  Example: ["I'm claustrophobic.","What does \"claustrophobic\" mean?","It means he's afraid of Santa Claus.","No, it doesn't.","HO-HO-HO","Stop it, Patrick, you're scaring him!"]

8-lines templates (2 templates):
• ptj: Phoebe Teaching Joey
  Example: ["Cast it","Cast it","into","into","the fire","the fire","Cast it into the fire.","Keep the Ring of Power!"]
• wallet: Patrick Star's Wallet
  Example: ["Aren't you Patrick Star?","Yup.","And this is your ID?","Yup.","I found the ID in this wallet so it must be yours.","That makes sense to me.","Then take it!","It's not my wallet."]

Browse all templates at https://memegen.link/templates/`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      template: {
        type: 'string' as const,
        enum: getTemplateIds(),
        description: 'The meme template to use',
      },
      text_lines: {
        type: 'array' as const,
        items: {
          type: 'string' as const,
        },
        minItems: 1,
        maxItems: 8,
        description: 'Array of text lines for the meme (1-8 lines depending on template)',
      },
    },
    required: ['template', 'text_lines'] as const,
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
  const { template, text_lines } = args;

  if (!isValidTemplate(template)) {
    throw new Error(`Invalid template: ${template}`);
  }

  // Validate slot count matches template requirements
  const templateInfo = templates[template];
  if (text_lines.length !== templateInfo.slots) {
    throw new Error(
      `Template '${template}' requires exactly ${templateInfo.slots} text lines, got ${text_lines.length}. ` +
        `Example: ${JSON.stringify(templateInfo.example)}`
    );
  }

  const url = buildMemeUrl(template, text_lines);
  const base64Image = await fetchImageAsBase64(url);

  return { url, base64Image };
}
