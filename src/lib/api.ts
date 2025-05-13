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
        "gonna": ["going to", "will", "intend to"],
        "wanna": ["want to", "would like to", "wish to"],
        "gotta": ["have to", "must", "need to"],
        "dunno": ["do not know", "am not certain", "am not aware"],
        "y'all": ["all of you", "everyone", "you all"],
        "ain't": ["is not", "are not", "am not"],
        "can't": ["cannot", "am unable to", "am not able to"],
        "don't": ["do not", "does not", "am not inclined to"],
        "won't": ["will not", "shall not", "am not willing to"],
        "shouldn't": ["should not", "ought not to", "would be inadvisable to"],
        
        // Casual words to formal alternatives
        "yeah": ["yes", "indeed", "certainly", "affirmative"],
        "nope": ["no", "negative", "certainly not"],
        "hey": ["hello", "greetings", "good day"],
        "hi": ["hello", "greetings", "salutations"],
        "bye": ["goodbye", "farewell", "until next time"],
        "ok": ["acceptable", "satisfactory", "understood", "acknowledged"],
        "thanks": ["thank you", "I appreciate it", "I am grateful"],
        "sorry": ["I apologize", "please excuse me", "I regret"],
        
        // Informal phrases to formal expressions
        "a lot": ["substantially", "considerably", "significantly"],
        "sort of": ["somewhat", "relatively", "to some extent"],
        "kind of": ["somewhat", "rather", "to a certain degree"],
        "stuff": ["items", "materials", "elements", "components"],
        "things": ["matters", "aspects", "elements", "factors"],
        "guy": ["individual", "person", "gentleman"],
        "guys": ["individuals", "people", "personnel", "colleagues"],
        
        // Intensifiers to more formal alternatives
        "really": ["quite", "considerably", "substantially"],
        "very": ["exceedingly", "remarkably", "notably"],
        "super": ["exceptionally", "extraordinarily", "remarkably"],
        "totally": ["completely", "entirely", "thoroughly"],
        "awesome": ["excellent", "commendable", "impressive"],
        "great": ["excellent", "exceptional", "outstanding"],
        "cool": ["impressive", "admirable", "noteworthy"],
        
        // Filler words removal
        "like,\\s": ["", ", ", " "],
        "um,\\s": ["", ", ", " "],
        "uh,\\s": ["", ", ", " "],
        "you know,\\s": ["", ", ", " "],

        // Basic grammar improvements
        "(^|\\s)i($|\\s)": ["$1I$2"],
        "!+": ["."],
        "\\.{2,}": ["."],
        
        // Additional professional phrases
        "need to": ["require", "necessitate", "find it necessary to"],
        "have to": ["must", "am required to", "am obligated to"],
        "tell": ["inform", "advise", "communicate"],
        "ask": ["inquire", "request", "solicit information"],
        "get": ["obtain", "acquire", "procure", "receive"],
        "big": ["substantial", "significant", "considerable", "extensive"],
        "small": ["minimal", "modest", "limited", "minor"],
        "good": ["satisfactory", "advantageous", "beneficial", "favorable"],
        "bad": ["unsatisfactory", "unfavorable", "problematic", "detrimental"],
        "happy": ["pleased", "gratified", "content", "delighted"],
        "sad": ["disappointed", "disheartened", "discouraged", "crestfallen"],
        "worried": ["concerned", "apprehensive", "troubled", "disquieted"],
        "scared": ["apprehensive", "alarmed", "disquieted", "perturbed"]
      };
      
      // Apply formal replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(formalReplacements)) {
        // Create RegExp from string pattern, adding flags as needed
        const regex = new RegExp(pattern, 'gi');
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      return result;
    },
    
    friendly: (text: string) => {
      const friendlyReplacements: Record<string, string[]> = {
        // Formal phrases to friendly alternatives
        "Hello": ["Hey there", "Hi friend", "Hey", "Hi there"],
        "Good morning": ["Morning!", "Hey, good morning", "Rise and shine"],
        "Good afternoon": ["Afternoon!", "Hey there", "Hi there"],
        "Good evening": ["Evening!", "Hey there", "Hi there"],
        "Thank you": ["Thanks a bunch", "Thanks!", "Really appreciate it", "Thanks so much"],
        "Thanks": ["Thanks a bunch!", "Appreciate it!", "Thanks a million!"],
        "Please": ["Please", "If you don't mind", "If you could", "Would you mind"],
        "Regards": ["Cheers", "Take care", "All the best"],
        
        // Make sentences more engaging
        "\\.": ["! ", ". ", "... ", ". ", "! "],
        
        // Add friendly emphasis
        "important": ["super important", "really important", "crucial"],
        "good": ["awesome", "fantastic", "great", "lovely"],
        "great": ["amazing", "fantastic", "awesome", "super cool"],
        "interesting": ["fascinating", "cool", "intriguing", "neat"],
        
        // Add personal touches
        "I think": ["I feel", "In my opinion", "From my perspective"],
        "I believe": ["I feel like", "The way I see it", "I'm pretty sure"],
        
        // Friendly additions
        "Yes": ["Absolutely!", "For sure!", "Definitely!"],
        "No": ["Not really", "Afraid not", "Nope"],
        "Maybe": ["Perhaps", "Possibly", "Could be!"],
        
        // Casual expressions
        "difficult": ["tricky", "not easy", "challenging"],
        "problem": ["issue", "hiccup", "challenge"],
        "error": ["oops", "slip-up", "mistake"],
        "concerned": ["worried", "a bit anxious", "troubled"],
        
        // Add emoticons and emoji references (as text)
        "happy": ["happy 😊", "thrilled", "delighted"],
        "sad": ["sad 😢", "down", "unhappy"],
        "angry": ["frustrated", "annoyed", "upset"],
        "confused": ["puzzled", "not sure", "scratching my head"],
        
        // Friendly emphasis
        "very": ["super", "really", "totally"],
        "extremely": ["incredibly", "absolutely", "completely"],
        
        // Personal connections
        "you should": ["you might want to", "have you tried", "why not"],
        "you need to": ["you might need to", "it'd be good if you could", "try to"],
        
        // Additional casual phrases
        "in addition": ["also", "plus", "on top of that"],
        "however": ["but", "though", "still"],
        "therefore": ["so", "that's why", "which means"],
        "consequently": ["so", "which means", "as a result"],
        "implement": ["put in place", "use", "try out"],
        "achieve": ["get", "reach", "nail"],
        "obtain": ["get", "grab", "pick up"],
        "purchase": ["buy", "get", "pick up"],
        "sufficient": ["enough", "plenty", "loads of"],
        "insufficient": ["not enough", "too little", "lacking"],
        "frequently": ["often", "a lot", "tons of times"],
        "rarely": ["hardly ever", "almost never", "once in a blue moon"],
        "assistance": ["help", "a hand", "support"],
        "attempt": ["try", "have a go", "take a shot"],
        "communicate": ["talk", "chat", "reach out"],
        "requested": ["asked for", "wanted", "was hoping for"],
        "inquire": ["ask", "wonder", "curious about"],
        "proceed": ["go ahead", "move forward", "carry on"],
        "comprehend": ["get it", "understand", "see what you mean"]
      };
      
      // Apply friendly replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(friendlyReplacements)) {
        const flags = pattern.includes("\\s") || pattern.includes("^") || pattern.includes("$") ? "gi" : "gi";
        const regex = new RegExp(pattern, flags);
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      return result;
    },
    
    concise: (text: string) => {
      // First apply some specific replacements
      const conciseReplacements: Record<string, string[]> = {
        // Remove filler words and phrases
        "in order to": ["to"],
        "for the purpose of": ["to", "for"],
        "due to the fact that": ["because", "since", "as"],
        "in spite of the fact that": ["although", "despite"],
        "with regard to": ["about", "regarding", "concerning"],
        "in reference to": ["about", "regarding", "on"],
        "in the event that": ["if", "should", "when"],
        "in the process of": ["during", "while", "as"],
        
        // Replace verbose phrases
        "at this point in time": ["now", "currently", "presently"],
        "it is important to note that": ["note that", "importantly", "notably"],
        "take into consideration": ["consider", "note", "remember"],
        "in light of the fact that": ["because", "since", "as"],
        "in the final analysis": ["finally", "ultimately", "in conclusion"],
        
        // Simplify common expressions
        "a large number of": ["many", "numerous", "several"],
        "a majority of": ["most", "many"],
        "a sufficient amount of": ["enough", "sufficient"],
        "at the present time": ["now", "currently", "today"],
        "for the reason that": ["because", "since"],
        "in the near future": ["soon", "shortly", "presently"],
        
        // Reduce redundancy
        "absolutely essential": ["essential", "crucial", "vital"],
        "basic fundamentals": ["basics", "fundamentals"],
        "completely eliminated": ["eliminated", "removed"],
        "current status": ["status", "state", "position"],
        "end result": ["result", "outcome"],
        "final outcome": ["outcome", "result"],
        "future plans": ["plans", "intentions"],
        "past history": ["history", "background"],
        "unexpected surprise": ["surprise"],
        
        // Simplify verb phrases
        "make a decision": ["decide", "choose", "determine"],
        "perform an analysis of": ["analyze", "examine", "study"],
        "conduct an investigation": ["investigate", "explore", "examine"],
        "provide assistance to": ["help", "assist", "support"],
        "give consideration to": ["consider", "think about"],
        
        // Replace wordy transitions
        "as a matter of fact": ["in fact", "actually", "indeed"],
        "at the end of the day": ["ultimately", "finally", "in conclusion"],
        "for all intents and purposes": ["essentially", "practically", "basically"],
        
        // Trim additional redundant phrases
        "each and every": ["each", "every", "all"],
        "various different": ["various", "different"],
        "any and all": ["any", "all"],
        "first and foremost": ["first", "primarily", "mainly"],
        "true and accurate": ["accurate", "true", "correct"],
        
        // Convert passive to active voice (simple cases)
        "it can be seen that": ["clearly", "evidently", "obviously"],
        "it should be noted that": ["note that", "notably", "importantly"],
        "it is recommended that": ["we recommend", "recommend that", "should"],
        
        // Additional concise substitutions
        "in my opinion": ["I think", "I believe"],
        "as far as I'm concerned": ["I believe", "I think"],
        "for the most part": ["mostly", "mainly", "generally"],
        "on account of": ["because", "due to", "since"],
        "in addition to": ["besides", "also", "plus"],
        "in spite of": ["despite", "notwithstanding"],
        "as a result of": ["because", "due to", "from"],
        "in accordance with": ["per", "following", "by"],
        "with the exception of": ["except", "excluding", "apart from"],
        "in the absence of": ["without", "lacking"],
        "in conjunction with": ["with", "alongside", "together with"],
        "in relation to": ["about", "regarding", "concerning"],
        "in close proximity to": ["near", "close to", "by"],
        "on a regular basis": ["regularly", "often", "frequently"]
      };
      
      // Apply concise replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(conciseReplacements)) {
        const flags = pattern.includes("\\s") || pattern.includes("^") || pattern.includes("$") ? "gi" : "gi";
        const regex = new RegExp(pattern, flags);
        result = result.replace(regex, () => getRandomSynonym(replacements));
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
        "I think": ["I firmly believe", "I am convinced", "I know", "I am certain"],
        "I believe": ["I am confident", "I am convinced", "I know for certain"],
        "I feel": ["I strongly feel", "I am convinced", "I am certain"],
        
        // Enhance positive descriptions
        "good": ["excellent", "outstanding", "exceptional", "remarkable"],
        "nice": ["outstanding", "excellent", "remarkable", "impressive"],
        "important": ["crucial", "essential", "critical", "vital", "indispensable"],
        "helpful": ["invaluable", "essential", "crucial", "indispensable"],
        "useful": ["invaluable", "essential", "critical", "game-changing"],
        
        // Strengthen verbs
        "should": ["must", "need to", "have to", "should absolutely"],
        "could": ["can definitely", "will be able to", "have the power to"],
        "might": ["will likely", "can certainly", "will probably"],
        
        // Add persuasive phrasing
        "You should": ["You absolutely must", "You need to", "You owe it to yourself to"],
        "consider": ["seriously consider", "make it a priority to", "take decisive action on"],
        "try": ["commit to", "embrace", "seize the opportunity to"],
        
        // Enhance urgency
        "soon": ["immediately", "right now", "without delay", "as soon as possible"],
        "later": ["before it's too late", "while you still can", "before you miss out"],
        "eventually": ["very soon", "imminently", "in the near future"],
        
        // Add persuasive transitions
        "also": ["furthermore", "moreover", "additionally", "what's more"],
        "but": ["however", "nevertheless", "yet importantly", "but crucially"],
        "so": ["therefore", "consequently", "as a result", "this clearly shows"],
        
        // Transform neutral phrases to persuasive ones
        "there are some benefits": ["there are significant advantages", "there are remarkable benefits", "there are compelling reasons"],
        "it can help": ["it will transform", "it will revolutionize", "it will significantly improve"],
        "it is an option": ["it is the optimal solution", "it is the superior choice", "it is the smartest decision"],
        
        // Add certainty
        "probably": ["certainly", "definitely", "without doubt", "unquestionably"],
        "maybe": ["most assuredly", "without a doubt", "definitely"],
        "possibly": ["almost certainly", "very likely", "with high probability"],
        
        // Create emotional connection
        "interested in": ["passionate about", "deeply committed to", "invested in"],
        "like": ["love", "adore", "greatly appreciate", "genuinely value"],
        "dislike": ["strongly oppose", "reject", "find unacceptable"],
        
        // Add power words
        "improve": ["transform", "revolutionize", "elevate", "maximize"],
        "increase": ["dramatically boost", "skyrocket", "multiply", "amplify"],
        "benefit": ["game-changing advantage", "critical benefit", "vital improvement"],
        
        // End with calls to action
        "\\.$$": ["!"],
        "\\. ": [". ", "! ", ". ", "! ", ". "],
        
        // Additional persuasive phrases
        "change": ["transform", "revolutionize", "reinvent", "reimagine"],
        "different": ["revolutionary", "groundbreaking", "innovative", "cutting-edge"],
        "new": ["innovative", "pioneering", "breakthrough", "cutting-edge"],
        "problem": ["challenge", "obstacle", "hurdle", "barrier"],
        "solution": ["answer", "remedy", "breakthrough", "game-changer"],
        "opportunity": ["golden opportunity", "rare chance", "unique opening", "perfect timing"],
        "easy": ["effortless", "straightforward", "simple", "uncomplicated"],
        "difficult": ["challenging", "demanding", "complex", "intricate"],
        "expensive": ["premium", "high-value", "investment-grade", "quality"],
        "cheap": ["cost-effective", "economical", "affordable", "value-priced"],
        "fast": ["rapid", "swift", "immediate", "instantaneous"],
        "slow": ["deliberate", "careful", "methodical", "thorough"],
        "risk": ["calculated risk", "strategic move", "bold step", "smart gamble"],
        "safe": ["secure", "protected", "guaranteed", "assured"],
        "begin": ["embark on", "initiate", "launch", "commence"],
        "end": ["conclude", "finalize", "complete", "accomplish"],
        "find": ["discover", "uncover", "reveal", "identify"],
        "create": ["craft", "forge", "establish", "build"],
        "save": ["preserve", "secure", "protect", "safeguard"],
        "ensure": ["guarantee", "secure", "safeguard", "assure"]
      };
      
      // Apply persuasive replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(persuasiveReplacements)) {
        const flags = pattern.includes("\\s") || pattern.includes("^") || pattern.includes("$") ? "gi" : "gi";
        const regex = new RegExp(pattern, flags);
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      return result;
    },
    
    creative: (text: string) => {
      const creativeReplacements: Record<string, string[]> = {
        // Transform ordinary words to vivid alternatives
        "The": ["The magnificent", "The wondrous", "The captivating", "The enchanting"],
        "is": ["dances as", "unfolds as", "blossoms into", "transforms into", "emerges as"],
        "was": ["emerged as", "manifested as", "blossomed into", "transformed into"],
        "went": ["ventured", "journeyed", "soared", "wandered", "drifted"],
        "said": ["expressed", "whispered", "declared", "proclaimed", "conveyed"],
        
        // Enhance descriptions
        "beautiful": ["breathtaking", "mesmerizing", "enchanting", "captivating", "spellbinding"],
        "good": ["extraordinary", "magnificent", "splendid", "marvelous", "wondrous"],
        "bad": ["catastrophic", "haunting", "dreadful", "lamentable", "woeful"],
        "big": ["colossal", "monumental", "towering", "mammoth", "gargantuan"],
        "small": ["miniature", "diminutive", "petite", "tiny", "microscopic"],
        
        // Add vibrant verbs
        "walk": ["stroll", "saunter", "glide", "meander", "wander"],
        "run": ["dash", "sprint", "bound", "race", "zoom"],
        "look": ["gaze", "glimpse", "peer", "observe", "behold"],
        "see": ["witness", "behold", "observe", "gaze upon", "perceive"],
        "touch": ["caress", "graze", "brush against", "make contact with"],
        
        // Sensory enhancements
        "loud": ["thunderous", "deafening", "booming", "resonant", "reverberating"],
        "quiet": ["hushed", "whispered", "muted", "subdued", "tranquil"],
        "bright": ["radiant", "luminous", "dazzling", "gleaming", "resplendent"],
        "dark": ["shadowy", "mysterious", "enigmatic", "obscure", "dusky"],
        "soft": ["velvety", "silky", "delicate", "tender", "gossamer"],
        
        // Metaphorical substitutions
        "fast": ["swift as an arrow", "quick as lightning", "rapid as a river", "fleet as the wind"],
        "slow": ["languid as honey", "gradual as twilight", "unhurried as a cloud", "deliberate as a dream"],
        "happy": ["joyful as a songbird", "elated as a soaring eagle", "jubilant as spring flowers", "delighted as a child"],
        "sad": ["melancholy as autumn rain", "sorrowful as a wilted rose", "forlorn as a lost melody", "wistful as fading twilight"],
        
        // Nature-inspired imagery
        "morning": ["dawn's first light", "sunrise symphony", "daybreak's gentle awakening", "morning's golden embrace"],
        "evening": ["twilight's gentle veil", "dusk's amber glow", "sunset's fiery canvas", "evening's serene descent"],
        "water": ["crystalline depths", "liquid silver", "flowing essence", "aqueous expanse"],
        "sky": ["celestial canvas", "heavenly vault", "azure expanse", "atmospheric ocean"],
        
        // Emotional depth
        "love": ["profound adoration", "heart's deepest yearning", "soul's eternal flame", "boundless affection"],
        "hate": ["profound aversion", "bitter animosity", "seething contempt", "venomous disdain"],
        "fear": ["primal dread", "chilling apprehension", "haunting trepidation", "paralyzing terror"],
        "hope": ["radiant possibility", "luminous aspiration", "shimmering promise", "brightening prospect"],
        
        // Sound and movement
        "sound": ["melody", "rhythm", "harmony", "symphony", "cadence"],
        "move": ["dance", "flow", "glide", "sweep", "undulate"],
        "speak": ["articulate", "voice", "express", "convey", "communicate"],
        "think": ["contemplate", "ponder", "reflect", "muse", "deliberate"],
        
        // Time references
        "day": ["sunlit hours", "diurnal passage", "daylight's reign", "solar journey"],
        "night": ["velvet darkness", "starlit realm", "nocturnal canvas", "moonlit domain"],
        "year": ["revolution around the sun", "seasonal cycle", "annual journey", "Earth's complete orbit"],
        "moment": ["fleeting instant", "brief eternity", "ephemeral fragment", "passing breath"],
        
        // Abstract concepts
        "idea": ["illuminating concept", "mental revelation", "intellectual spark", "cognitive inspiration"],
        "truth": ["unveiled reality", "pristine verity", "unvarnished actuality", "crystal clarity"],
        "dream": ["nocturnal vision", "subconscious odyssey", "slumbering fantasy", "night's revelation"],
        "memory": ["echoing recollection", "mental imprint", "cognitive artifact", "remembered essence"],
        
        // Additional creative flourishes
        "person": ["soul", "being", "individual", "mortal", "spirit"],
        "place": ["realm", "domain", "locale", "haven", "sanctuary"],
        "thing": ["entity", "artifact", "creation", "manifestation", "phenomenon"],
        "old": ["ancient", "venerable", "timeworn", "weathered", "archaic"],
        "new": ["nascent", "freshly-minted", "newborn", "pristine", "untouched"],
        "start": ["genesis", "inception", "dawn", "emergence", "birth"],
        "end": ["culmination", "finale", "conclusion", "denouement", "resolution"],
        "change": ["metamorphosis", "transformation", "evolution", "transmutation", "alchemy"]
      };
      
      // Apply creative replacements
      let result = text;
      for (const [pattern, replacements] of Object.entries(creativeReplacements)) {
        const flags = pattern.includes("\\s") || pattern.includes("^") || pattern.includes("$") ? "gi" : "gi";
        const regex = new RegExp(pattern, flags);
        result = result.replace(regex, () => getRandomSynonym(replacements));
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

// New function to check plagiarism using Undetectable AI
export interface PlagiarismResult {
  plagiarismLevel: number;
  plagiarizedSections: {
    text: string;
    score: number;
    startIndex: number;
    endIndex: number;
  }[];
  originalScore: number;
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult> {
  try {
    console.log('Calling check-plagiarism edge function');
    
    const { data, error } = await supabase.functions.invoke('check-plagiarism', {
      body: { text }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    console.log('Plagiarism check completed successfully');
    return {
      plagiarismLevel: data.plagiarismLevel || 1,
      plagiarizedSections: data.plagiarizedSections || [],
      originalScore: data.originalScore || 0
    };
  } catch (error) {
    console.error('Error in checkPlagiarism:', error);
    
    // Return simple fallback result with low plagiarism score
    return {
      plagiarismLevel: 1, // Low plagiarism level as fallback
      plagiarizedSections: [],
      originalScore: 0
    };
  }
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
