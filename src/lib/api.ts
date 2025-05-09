
// API service for text humanization

import { supabase } from "@/integrations/supabase/client";

interface HumanizeTextRequest {
  text: string;
  tone: string;
}

interface HumanizeTextResponse {
  humanizedText: string;
  source?: 'api' | 'fallback';
  plagiarismLevel?: number;
}

// Function to humanize text using our Supabase edge function that calls OpenAI
export async function humanizeText(request: HumanizeTextRequest): Promise<HumanizeTextResponse> {
  try {
    console.log('Calling humanize-text edge function with tone:', request.tone);
    
    const { data, error } = await supabase.functions.invoke('humanize-text', {
      body: {
        text: request.text,
        tone: request.tone
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    console.log('Edge function response received successfully');
    return { 
      humanizedText: data.humanizedText, 
      source: 'api',
      plagiarismLevel: data.plagiarismLevel || 1
    };
  } catch (error) {
    console.error('Error in humanizeText:', error);
    console.log('Falling back to local humanization');
    
    // Fall back to local mock if the edge function fails
    const fallbackResult = fallbackHumanizeText(request);
    return { ...fallbackResult, source: 'fallback' };
  }
}

// Helper function to get a random item from an array
const getRandomSynonym = (synonyms: string[]): string => {
  const randomIndex = Math.floor(Math.random() * synonyms.length);
  return synonyms[randomIndex];
};

// Fallback function to use if the API call fails
function fallbackHumanizeText(request: HumanizeTextRequest): HumanizeTextResponse {
  const { text, tone } = request;
  
  // Enhanced tone responses with extensive replacements
  const toneResponses: Record<string, (text: string) => string> = {
    formal: (text: string) => {
      const formalReplacements: Record<string, string[]> = {
        // Contractions to formal expressions
        /gonna/gi: ["going to", "will", "intend to"],
        /wanna/gi: ["want to", "would like to", "wish to"],
        /gotta/gi: ["have to", "must", "need to"],
        /dunno/gi: ["do not know", "am not certain", "am not aware"],
        /y'all/gi: ["all of you", "everyone", "you all"],
        /ain't/gi: ["is not", "are not", "am not"],
        /can't/gi: ["cannot", "am unable to", "am not able to"],
        /don't/gi: ["do not", "does not", "am not inclined to"],
        /won't/gi: ["will not", "shall not", "am not willing to"],
        /shouldn't/gi: ["should not", "ought not to", "would be inadvisable to"],
        
        // Casual words to formal alternatives
        /yeah/gi: ["yes", "indeed", "certainly", "affirmative"],
        /nope/gi: ["no", "negative", "certainly not"],
        /hey/gi: ["hello", "greetings", "good day"],
        /hi/gi: ["hello", "greetings", "salutations"],
        /bye/gi: ["goodbye", "farewell", "until next time"],
        /ok/gi: ["acceptable", "satisfactory", "understood", "acknowledged"],
        /thanks/gi: ["thank you", "I appreciate it", "I am grateful"],
        /sorry/gi: ["I apologize", "please excuse me", "I regret"],
        
        // Informal phrases to formal expressions
        /a lot/gi: ["substantially", "considerably", "significantly"],
        /sort of/gi: ["somewhat", "relatively", "to some extent"],
        /kind of/gi: ["somewhat", "rather", "to a certain degree"],
        /stuff/gi: ["items", "materials", "elements", "components"],
        /things/gi: ["matters", "aspects", "elements", "factors"],
        /guy/gi: ["individual", "person", "gentleman"],
        /guys/gi: ["individuals", "people", "personnel", "colleagues"],
        
        // Intensifiers to more formal alternatives
        /really/gi: ["quite", "considerably", "substantially"],
        /very/gi: ["exceedingly", "remarkably", "notably"],
        /super/gi: ["exceptionally", "extraordinarily", "remarkably"],
        /totally/gi: ["completely", "entirely", "thoroughly"],
        /awesome/gi: ["excellent", "commendable", "impressive"],
        /great/gi: ["excellent", "exceptional", "outstanding"],
        /cool/gi: ["impressive", "admirable", "noteworthy"],
        
        // Filler words removal
        /like,\s/gi: ["", ", ", " "],
        /um,\s/gi: ["", ", ", " "],
        /uh,\s/gi: ["", ", ", " "],
        /you know,\s/gi: ["", ", ", " "],

        // Basic grammar improvements
        /(^|\s)i($|\s)/gi: ["$1I$2"],
        /!+/g: ["."],
        /\.{2,}/g: ["."],
        
        // Additional professional phrases
        /need to/gi: ["require", "necessitate", "find it necessary to"],
        /have to/gi: ["must", "am required to", "am obligated to"],
        /tell/gi: ["inform", "advise", "communicate"],
        /ask/gi: ["inquire", "request", "solicit information"],
        /get/gi: ["obtain", "acquire", "procure", "receive"],
        /big/gi: ["substantial", "significant", "considerable", "extensive"],
        /small/gi: ["minimal", "modest", "limited", "minor"],
        /good/gi: ["satisfactory", "advantageous", "beneficial", "favorable"],
        /bad/gi: ["unsatisfactory", "unfavorable", "problematic", "detrimental"],
        /happy/gi: ["pleased", "gratified", "content", "delighted"],
        /sad/gi: ["disappointed", "disheartened", "discouraged", "crestfallen"],
        /worried/gi: ["concerned", "apprehensive", "troubled", "disquieted"],
        /scared/gi: ["apprehensive", "alarmed", "disquieted", "perturbed"],
      };
      
      // Apply formal replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(formalReplacements)) {
        result = result.replace(new RegExp(pattern, 'g'), () => getRandomSynonym(replacements));
      }
      
      return result;
    },
    
    friendly: (text: string) => {
      const friendlyReplacements: Record<string, string[]> = {
        // Formal phrases to friendly alternatives
        /Hello/gi: ["Hey there", "Hi friend", "Hey", "Hi there"],
        /Good morning/gi: ["Morning!", "Hey, good morning", "Rise and shine"],
        /Good afternoon/gi: ["Afternoon!", "Hey there", "Hi there"],
        /Good evening/gi: ["Evening!", "Hey there", "Hi there"],
        /Thank you/gi: ["Thanks a bunch", "Thanks!", "Really appreciate it", "Thanks so much"],
        /Thanks/gi: ["Thanks a bunch!", "Appreciate it!", "Thanks a million!"],
        /Please/gi: ["Please", "If you don't mind", "If you could", "Would you mind"],
        /Regards/gi: ["Cheers", "Take care", "All the best"],
        
        // Make sentences more engaging
        /\./g: ["! ", ". ", "... ", ". ", "! "],
        
        // Add friendly emphasis
        /important/gi: ["super important", "really important", "crucial"],
        /good/gi: ["awesome", "fantastic", "great", "lovely"],
        /great/gi: ["amazing", "fantastic", "awesome", "super cool"],
        /interesting/gi: ["fascinating", "cool", "intriguing", "neat"],
        
        // Add personal touches
        /I think/gi: ["I feel", "In my opinion", "From my perspective"],
        /I believe/gi: ["I feel like", "The way I see it", "I'm pretty sure"],
        
        // Friendly additions
        /Yes/gi: ["Absolutely!", "For sure!", "Definitely!"],
        /No/gi: ["Not really", "Afraid not", "Nope"],
        /Maybe/gi: ["Perhaps", "Possibly", "Could be!"],
        
        // Casual expressions
        /difficult/gi: ["tricky", "not easy", "challenging"],
        /problem/gi: ["issue", "hiccup", "challenge"],
        /error/gi: ["oops", "slip-up", "mistake"],
        /concerned/gi: ["worried", "a bit anxious", "troubled"],
        
        // Add emoticons and emoji references (as text)
        /happy/gi: ["happy 😊", "thrilled", "delighted"],
        /sad/gi: ["sad 😢", "down", "unhappy"],
        /angry/gi: ["frustrated", "annoyed", "upset"],
        /confused/gi: ["puzzled", "not sure", "scratching my head"],
        
        // Friendly emphasis
        /very/gi: ["super", "really", "totally"],
        /extremely/gi: ["incredibly", "absolutely", "completely"],
        
        // Personal connections
        /you should/gi: ["you might want to", "have you tried", "why not"],
        /you need to/gi: ["you might need to", "it'd be good if you could", "try to"],
        
        // Additional casual phrases
        /in addition/gi: ["also", "plus", "on top of that"],
        /however/gi: ["but", "though", "still"],
        /therefore/gi: ["so", "that's why", "which means"],
        /consequently/gi: ["so", "which means", "as a result"],
        /implement/gi: ["put in place", "use", "try out"],
        /achieve/gi: ["get", "reach", "nail"],
        /obtain/gi: ["get", "grab", "pick up"],
        /purchase/gi: ["buy", "get", "pick up"],
        /sufficient/gi: ["enough", "plenty", "loads of"],
        /insufficient/gi: ["not enough", "too little", "lacking"],
        /frequently/gi: ["often", "a lot", "tons of times"],
        /rarely/gi: ["hardly ever", "almost never", "once in a blue moon"],
        /assistance/gi: ["help", "a hand", "support"],
        /attempt/gi: ["try", "have a go", "take a shot"],
        /communicate/gi: ["talk", "chat", "reach out"],
        /requested/gi: ["asked for", "wanted", "was hoping for"],
        /inquire/gi: ["ask", "wonder", "curious about"],
        /proceed/gi: ["go ahead", "move forward", "carry on"],
        /comprehend/gi: ["get it", "understand", "see what you mean"],
      };
      
      // Apply friendly replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(friendlyReplacements)) {
        result = result.replace(new RegExp(pattern, 'g'), () => getRandomSynonym(replacements));
      }
      
      return result;
    },
    
    concise: (text: string) => {
      // First apply some specific replacements
      const conciseReplacements: Record<string, string[]> = {
        // Remove filler words and phrases
        /in order to/gi: ["to"],
        /for the purpose of/gi: ["to", "for"],
        /due to the fact that/gi: ["because", "since", "as"],
        /in spite of the fact that/gi: ["although", "despite"],
        /with regard to/gi: ["about", "regarding", "concerning"],
        /in reference to/gi: ["about", "regarding", "on"],
        /in the event that/gi: ["if", "should", "when"],
        /in the process of/gi: ["during", "while", "as"],
        
        // Replace verbose phrases
        /at this point in time/gi: ["now", "currently", "presently"],
        /it is important to note that/gi: ["note that", "importantly", "notably"],
        /take into consideration/gi: ["consider", "note", "remember"],
        /in light of the fact that/gi: ["because", "since", "as"],
        /in the final analysis/gi: ["finally", "ultimately", "in conclusion"],
        
        // Simplify common expressions
        /a large number of/gi: ["many", "numerous", "several"],
        /a majority of/gi: ["most", "many"],
        /a sufficient amount of/gi: ["enough", "sufficient"],
        /at the present time/gi: ["now", "currently", "today"],
        /for the reason that/gi: ["because", "since"],
        /in the near future/gi: ["soon", "shortly", "presently"],
        
        // Reduce redundancy
        /absolutely essential/gi: ["essential", "crucial", "vital"],
        /basic fundamentals/gi: ["basics", "fundamentals"],
        /completely eliminated/gi: ["eliminated", "removed"],
        /current status/gi: ["status", "state", "position"],
        /end result/gi: ["result", "outcome"],
        /final outcome/gi: ["outcome", "result"],
        /future plans/gi: ["plans", "intentions"],
        /past history/gi: ["history", "background"],
        /unexpected surprise/gi: ["surprise"],
        
        // Simplify verb phrases
        /make a decision/gi: ["decide", "choose", "determine"],
        /perform an analysis of/gi: ["analyze", "examine", "study"],
        /conduct an investigation/gi: ["investigate", "explore", "examine"],
        /provide assistance to/gi: ["help", "assist", "support"],
        /give consideration to/gi: ["consider", "think about"],
        
        // Replace wordy transitions
        /as a matter of fact/gi: ["in fact", "actually", "indeed"],
        /at the end of the day/gi: ["ultimately", "finally", "in conclusion"],
        /for all intents and purposes/gi: ["essentially", "practically", "basically"],
        
        // Trim additional redundant phrases
        /each and every/gi: ["each", "every", "all"],
        /various different/gi: ["various", "different"],
        /any and all/gi: ["any", "all"],
        /first and foremost/gi: ["first", "primarily", "mainly"],
        /true and accurate/gi: ["accurate", "true", "correct"],
        
        // Convert passive to active voice (simple cases)
        /it can be seen that/gi: ["clearly", "evidently", "obviously"],
        /it should be noted that/gi: ["note that", "notably", "importantly"],
        /it is recommended that/gi: ["we recommend", "recommend that", "should"],
        
        // Additional concise substitutions
        /in my opinion/gi: ["I think", "I believe"],
        /as far as I'm concerned/gi: ["I believe", "I think"],
        /for the most part/gi: ["mostly", "mainly", "generally"],
        /on account of/gi: ["because", "due to", "since"],
        /in addition to/gi: ["besides", "also", "plus"],
        /in spite of/gi: ["despite", "notwithstanding"],
        /as a result of/gi: ["because", "due to", "from"],
        /in accordance with/gi: ["per", "following", "by"],
        /with the exception of/gi: ["except", "excluding", "apart from"],
        /in the absence of/gi: ["without", "lacking"],
        /in conjunction with/gi: ["with", "alongside", "together with"],
        /in relation to/gi: ["about", "regarding", "concerning"],
        /in close proximity to/gi: ["near", "close to", "by"],
        /on a regular basis/gi: ["regularly", "often", "frequently"],
      };
      
      // Apply concise replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(conciseReplacements)) {
        result = result.replace(new RegExp(pattern, 'g'), () => getRandomSynonym(replacements));
      }
      
      // Then apply sentence shortening logic
      result = result
        .split(/\.|\n/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
        .map(sentence => {
          const words = sentence.split(" ");
          if (words.length > 8) {
            const keepCount = Math.min(8, Math.floor(words.length * 0.7));
            return words.slice(0, keepCount).join(" ") + ".";
          }
          return sentence + ".";
        })
        .join(" ");
      
      return result;
    },
    
    persuasive: (text: string) => {
      const persuasiveReplacements: Record<string, string[]> = {
        // Strengthen assertions
        /I think/gi: ["I firmly believe", "I am convinced", "I know", "I am certain"],
        /I believe/gi: ["I am confident", "I am convinced", "I know for certain"],
        /I feel/gi: ["I strongly feel", "I am convinced", "I am certain"],
        
        // Enhance positive descriptions
        /good/gi: ["excellent", "outstanding", "exceptional", "remarkable"],
        /nice/gi: ["outstanding", "excellent", "remarkable", "impressive"],
        /important/gi: ["crucial", "essential", "critical", "vital", "indispensable"],
        /helpful/gi: ["invaluable", "essential", "crucial", "indispensable"],
        /useful/gi: ["invaluable", "essential", "critical", "game-changing"],
        
        // Strengthen verbs
        /should/gi: ["must", "need to", "have to", "should absolutely"],
        /could/gi: ["can definitely", "will be able to", "have the power to"],
        /might/gi: ["will likely", "can certainly", "will probably"],
        
        // Add persuasive phrasing
        /You should/gi: ["You absolutely must", "You need to", "You owe it to yourself to"],
        /consider/gi: ["seriously consider", "make it a priority to", "take decisive action on"],
        /try/gi: ["commit to", "embrace", "seize the opportunity to"],
        
        // Enhance urgency
        /soon/gi: ["immediately", "right now", "without delay", "as soon as possible"],
        /later/gi: ["before it's too late", "while you still can", "before you miss out"],
        /eventually/gi: ["very soon", "imminently", "in the near future"],
        
        // Add persuasive transitions
        /also/gi: ["furthermore", "moreover", "additionally", "what's more"],
        /but/gi: ["however", "nevertheless", "yet importantly", "but crucially"],
        /so/gi: ["therefore", "consequently", "as a result", "this clearly shows"],
        
        // Transform neutral phrases to persuasive ones
        /there are some benefits/gi: ["there are significant advantages", "there are remarkable benefits", "there are compelling reasons"],
        /it can help/gi: ["it will transform", "it will revolutionize", "it will significantly improve"],
        /it is an option/gi: ["it is the optimal solution", "it is the superior choice", "it is the smartest decision"],
        
        // Add certainty
        /probably/gi: ["certainly", "definitely", "without doubt", "unquestionably"],
        /maybe/gi: ["most assuredly", "without a doubt", "definitely"],
        /possibly/gi: ["almost certainly", "very likely", "with high probability"],
        
        // Create emotional connection
        /interested in/gi: ["passionate about", "deeply committed to", "invested in"],
        /like/gi: ["love", "adore", "greatly appreciate", "genuinely value"],
        /dislike/gi: ["strongly oppose", "reject", "find unacceptable"],
        
        // Add power words
        /improve/gi: ["transform", "revolutionize", "elevate", "maximize"],
        /increase/gi: ["dramatically boost", "skyrocket", "multiply", "amplify"],
        /benefit/gi: ["game-changing advantage", "critical benefit", "vital improvement"],
        
        // End with calls to action
        /\.$/g: ["!"],
        /\. /g: [". ", "! ", ". ", "! ", ". "],
        
        // Additional persuasive phrases
        /change/gi: ["transform", "revolutionize", "reinvent", "reimagine"],
        /different/gi: ["revolutionary", "groundbreaking", "innovative", "cutting-edge"],
        /new/gi: ["innovative", "pioneering", "breakthrough", "cutting-edge"],
        /problem/gi: ["challenge", "obstacle", "hurdle", "barrier"],
        /solution/gi: ["answer", "remedy", "breakthrough", "game-changer"],
        /opportunity/gi: ["golden opportunity", "rare chance", "unique opening", "perfect timing"],
        /easy/gi: ["effortless", "straightforward", "simple", "uncomplicated"],
        /difficult/gi: ["challenging", "demanding", "complex", "intricate"],
        /expensive/gi: ["premium", "high-value", "investment-grade", "quality"],
        /cheap/gi: ["cost-effective", "economical", "affordable", "value-priced"],
        /fast/gi: ["rapid", "swift", "immediate", "instantaneous"],
        /slow/gi: ["deliberate", "careful", "methodical", "thorough"],
        /risk/gi: ["calculated risk", "strategic move", "bold step", "smart gamble"],
        /safe/gi: ["secure", "protected", "guaranteed", "assured"],
        /begin/gi: ["embark on", "initiate", "launch", "commence"],
        /end/gi: ["conclude", "finalize", "complete", "accomplish"],
        /find/gi: ["discover", "uncover", "reveal", "identify"],
        /create/gi: ["craft", "forge", "establish", "build"],
        /save/gi: ["preserve", "secure", "protect", "safeguard"],
        /ensure/gi: ["guarantee", "secure", "safeguard", "assure"],
      };
      
      // Apply persuasive replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(persuasiveReplacements)) {
        result = result.replace(new RegExp(pattern, 'g'), () => getRandomSynonym(replacements));
      }
      
      return result;
    },
    
    creative: (text: string) => {
      const creativeReplacements: Record<string, string[]> = {
        // Transform ordinary words to vivid alternatives
        /The/gi: ["The magnificent", "The wondrous", "The captivating", "The enchanting"],
        /is/gi: ["dances as", "unfolds as", "blossoms into", "transforms into", "emerges as"],
        /was/gi: ["emerged as", "manifested as", "blossomed into", "transformed into"],
        /went/gi: ["ventured", "journeyed", "soared", "wandered", "drifted"],
        /said/gi: ["expressed", "whispered", "declared", "proclaimed", "conveyed"],
        
        // Enhance descriptions
        /beautiful/gi: ["breathtaking", "mesmerizing", "enchanting", "captivating", "spellbinding"],
        /good/gi: ["extraordinary", "magnificent", "splendid", "marvelous", "wondrous"],
        /bad/gi: ["catastrophic", "haunting", "dreadful", "lamentable", "woeful"],
        /big/gi: ["colossal", "monumental", "towering", "mammoth", "gargantuan"],
        /small/gi: ["miniature", "diminutive", "petite", "tiny", "microscopic"],
        
        // Add vibrant verbs
        /walk/gi: ["stroll", "saunter", "glide", "meander", "wander"],
        /run/gi: ["dash", "sprint", "bound", "race", "zoom"],
        /look/gi: ["gaze", "glimpse", "peer", "observe", "behold"],
        /see/gi: ["witness", "behold", "observe", "gaze upon", "perceive"],
        /touch/gi: ["caress", "graze", "brush against", "make contact with"],
        
        // Sensory enhancements
        /loud/gi: ["thunderous", "deafening", "booming", "resonant", "reverberating"],
        /quiet/gi: ["hushed", "whispered", "muted", "subdued", "tranquil"],
        /bright/gi: ["radiant", "luminous", "dazzling", "gleaming", "resplendent"],
        /dark/gi: ["shadowy", "mysterious", "enigmatic", "obscure", "dusky"],
        /soft/gi: ["velvety", "silky", "delicate", "tender", "gossamer"],
        
        // Metaphorical substitutions
        /fast/gi: ["swift as an arrow", "quick as lightning", "rapid as a river", "fleet as the wind"],
        /slow/gi: ["languid as honey", "gradual as twilight", "unhurried as a cloud", "deliberate as a dream"],
        /happy/gi: ["joyful as a songbird", "elated as a soaring eagle", "jubilant as spring flowers", "delighted as a child"],
        /sad/gi: ["melancholy as autumn rain", "sorrowful as a wilted rose", "forlorn as a lost melody", "wistful as fading twilight"],
        
        // Nature-inspired imagery
        /morning/gi: ["dawn's first light", "sunrise symphony", "daybreak's gentle awakening", "morning's golden embrace"],
        /evening/gi: ["twilight's gentle veil", "dusk's amber glow", "sunset's fiery canvas", "evening's serene descent"],
        /water/gi: ["crystalline depths", "liquid silver", "flowing essence", "aqueous expanse"],
        /sky/gi: ["celestial canvas", "heavenly vault", "azure expanse", "atmospheric ocean"],
        
        // Emotional depth
        /love/gi: ["profound adoration", "heart's deepest yearning", "soul's eternal flame", "boundless affection"],
        /hate/gi: ["profound aversion", "bitter animosity", "seething contempt", "venomous disdain"],
        /fear/gi: ["primal dread", "chilling apprehension", "haunting trepidation", "paralyzing terror"],
        /hope/gi: ["radiant possibility", "luminous aspiration", "shimmering promise", "brightening prospect"],
        
        // Sound and movement
        /sound/gi: ["melody", "rhythm", "harmony", "symphony", "cadence"],
        /move/gi: ["dance", "flow", "glide", "sweep", "undulate"],
        /speak/gi: ["articulate", "voice", "express", "convey", "communicate"],
        /think/gi: ["contemplate", "ponder", "reflect", "muse", "deliberate"],
        
        // Time references
        /day/gi: ["sunlit hours", "diurnal passage", "daylight's reign", "solar journey"],
        /night/gi: ["velvet darkness", "starlit realm", "nocturnal canvas", "moonlit domain"],
        /year/gi: ["revolution around the sun", "seasonal cycle", "annual journey", "Earth's complete orbit"],
        /moment/gi: ["fleeting instant", "brief eternity", "ephemeral fragment", "passing breath"],
        
        // Abstract concepts
        /idea/gi: ["illuminating concept", "mental revelation", "intellectual spark", "cognitive inspiration"],
        /truth/gi: ["unveiled reality", "pristine verity", "unvarnished actuality", "crystal clarity"],
        /dream/gi: ["nocturnal vision", "subconscious odyssey", "slumbering fantasy", "night's revelation"],
        /memory/gi: ["echoing recollection", "mental imprint", "cognitive artifact", "remembered essence"],
        
        // Additional creative flourishes
        /person/gi: ["soul", "being", "individual", "mortal", "spirit"],
        /place/gi: ["realm", "domain", "locale", "haven", "sanctuary"],
        /thing/gi: ["entity", "artifact", "creation", "manifestation", "phenomenon"],
        /old/gi: ["ancient", "venerable", "timeworn", "weathered", "archaic"],
        /new/gi: ["nascent", "freshly-minted", "newborn", "pristine", "untouched"],
        /start/gi: ["genesis", "inception", "dawn", "emergence", "birth"],
        /end/gi: ["culmination", "finale", "conclusion", "denouement", "resolution"],
        /change/gi: ["metamorphosis", "transformation", "evolution", "transmutation", "alchemy"],
      };
      
      // Apply creative replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(creativeReplacements)) {
        result = result.replace(new RegExp(pattern, 'g'), () => getRandomSynonym(replacements));
      }
      
      return result;
    },
  };
  
  // Get tone transformer or default to identity function
  const transformer = toneResponses[tone] || ((t: string) => t);
  
  // Transform the text
  const humanizedText = transformer(text);
  
  // Generate a random plagiarism level between 1-3 for fallback mode
  const plagiarismLevel = Math.floor(Math.random() * 3) + 1;
  
  console.warn('Using fallback text humanization');
  return { humanizedText, plagiarismLevel };
}

// History storage in localStorage
export interface TextEntry {
  id: string;
  originalText: string;
  humanizedText: string;
  tone: string;
  timestamp: string;
  isFavorite: boolean;
  plagiarismLevel?: number;
}

export function saveTextEntry(entry: Omit<TextEntry, 'id' | 'timestamp'>): TextEntry {
  const newEntry: TextEntry = {
    ...entry,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  
  const history = getTextHistory();
  localStorage.setItem('textify-history', JSON.stringify([newEntry, ...history]));
  
  return newEntry;
}

export function getTextHistory(): TextEntry[] {
  const history = localStorage.getItem('textify-history');
  return history ? JSON.parse(history) : [];
}

export function updateTextEntry(id: string, updates: Partial<TextEntry>): TextEntry | null {
  const history = getTextHistory();
  const index = history.findIndex(entry => entry.id === id);
  
  if (index === -1) return null;
  
  const updatedEntry = { ...history[index], ...updates };
  history[index] = updatedEntry;
  
  localStorage.setItem('textify-history', JSON.stringify(history));
  return updatedEntry;
}

export function deleteTextEntry(id: string): boolean {
  const history = getTextHistory();
  const filteredHistory = history.filter(entry => entry.id !== id);
  
  if (filteredHistory.length === history.length) return false;
  
  localStorage.setItem('textify-history', JSON.stringify(filteredHistory));
  return true;
}

export function toggleFavorite(id: string): TextEntry | null {
  const history = getTextHistory();
  const entry = history.find(entry => entry.id === id);
  
  if (!entry) return null;
  
  return updateTextEntry(id, { isFavorite: !entry.isFavorite });
}
