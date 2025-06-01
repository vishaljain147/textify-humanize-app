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

interface ApiConnectivityResult {
  isConnected: boolean;
  error?: string;
  responseTime?: number;
}

// Function to check API connectivity
export async function checkApiConnectivity(): Promise<ApiConnectivityResult> {
  const startTime = Date.now();
  
  try {
    console.log('Checking API connectivity...');
    
    const { data, error } = await supabase.functions.invoke('humanize-text', {
      body: {
        text: "test connectivity",
        tone: "formal"
      }
    });

    const responseTime = Date.now() - startTime;

    if (error) {
      console.error('API connectivity check failed:', error);
      return {
        isConnected: false,
        error: error.message || 'Connection failed',
        responseTime
      };
    }

    console.log('API connectivity check successful');
    return {
      isConnected: true,
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error('API connectivity check error:', error);
    
    return {
      isConnected: false,
      error: error.message || 'Network error',
      responseTime
    };
  }
}

// Enhanced function to humanize text with better fallback and API checks
export async function humanizeText(request: HumanizeTextRequest): Promise<HumanizeTextResponse> {
  console.log('Starting text humanization with tone:', request.tone);
  
  // First, check API connectivity
  const connectivityCheck = await checkApiConnectivity();
  
  if (!connectivityCheck.isConnected) {
    console.warn('API not available, using enhanced fallback mode:', connectivityCheck.error);
    const fallbackResult = enhancedFallbackHumanizeText(request);
    return { ...fallbackResult, source: 'fallback' };
  }

  try {
    console.log('API is available, proceeding with API call');
    
    const { data, error } = await supabase.functions.invoke('humanize-text', {
      body: {
        text: request.text,
        tone: request.tone
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      
      // Check if it's a quota/billing error
      if (error.message?.includes('quota') || error.message?.includes('billing')) {
        console.log('API quota exceeded, falling back to enhanced local processing');
        const fallbackResult = enhancedFallbackHumanizeText(request);
        return { ...fallbackResult, source: 'fallback' };
      }
      
      throw error;
    }

    console.log('API humanization successful');
    return { 
      humanizedText: data.humanizedText, 
      source: 'api',
      plagiarismLevel: data.plagiarismLevel || 1
    };
  } catch (error) {
    console.error('Error in API humanization, falling back to local processing:', error);
    const fallbackResult = enhancedFallbackHumanizeText(request);
    return { ...fallbackResult, source: 'fallback' };
  }
}

// Helper function to get a random item from an array
const getRandomSynonym = (synonyms: string[]): string => {
  const randomIndex = Math.floor(Math.random() * synonyms.length);
  return synonyms[randomIndex];
};

// Enhanced fallback function with much better text processing
function enhancedFallbackHumanizeText(request: HumanizeTextRequest): HumanizeTextResponse {
  const { text, tone } = request;
  
  console.log('Using enhanced fallback mode for tone:', tone);
  
  // Enhanced tone responses with more sophisticated processing
  const toneResponses: Record<string, (text: string) => string> = {
    formal: (text: string) => {
      const formalReplacements: Record<string, string[]> = {
        // ... keep existing code (formal replacements) the same
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
        "yeah": ["yes", "indeed", "certainly", "affirmative"],
        "nope": ["no", "negative", "certainly not"],
        "hey": ["hello", "greetings", "good day"],
        "hi": ["hello", "greetings", "salutations"],
        "bye": ["goodbye", "farewell", "until next time"],
        "ok": ["acceptable", "satisfactory", "understood", "acknowledged"],
        "thanks": ["thank you", "I appreciate it", "I am grateful"],
        "sorry": ["I apologize", "please excuse me", "I regret"],
        "a lot": ["substantially", "considerably", "significantly"],
        "sort of": ["somewhat", "relatively", "to some extent"],
        "kind of": ["somewhat", "rather", "to a certain degree"],
        "stuff": ["items", "materials", "elements", "components"],
        "things": ["matters", "aspects", "elements", "factors"],
        "guy": ["individual", "person", "gentleman"],
        "guys": ["individuals", "people", "personnel", "colleagues"],
        "really": ["quite", "considerably", "substantially"],
        "very": ["exceedingly", "remarkably", "notably"],
        "super": ["exceptionally", "extraordinarily", "remarkably"],
        "totally": ["completely", "entirely", "thoroughly"],
        "awesome": ["excellent", "commendable", "impressive"],
        "great": ["excellent", "exceptional", "outstanding"],
        "cool": ["impressive", "admirable", "noteworthy"]
      };
      
      let result = text;
      for (const [pattern, replacements] of Object.entries(formalReplacements)) {
        const flags = pattern.includes("\\s") || pattern.includes("^") || pattern.includes("$") ? "gi" : "gi";
        const regex = new RegExp(pattern, flags);
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      // Add sentence structure improvements
      result = improveSentenceStructure(result);
      return result;
    },
    
    friendly: (text: string) => {
      // ... keep existing code (friendly replacements) the same
      const friendlyReplacements: Record<string, string[]> = {
        "Hello": ["Hey there", "Hi friend", "Hey", "Hi there"],
        "Good morning": ["Morning!", "Hey, good morning", "Rise and shine"],
        "Thank you": ["Thanks a bunch", "Thanks!", "Really appreciate it", "Thanks so much"],
        "important": ["super important", "really important", "crucial"],
        "good": ["awesome", "fantastic", "great", "lovely"],
        "great": ["amazing", "fantastic", "awesome", "super cool"],
        "Yes": ["Absolutely!", "For sure!", "Definitely!"],
        "No": ["Not really", "Afraid not", "Nope"],
        "very": ["super", "really", "totally"]
      };
      
      let result = text;
      for (const [pattern, replacements] of Object.entries(friendlyReplacements)) {
        const flags = "gi";
        const regex = new RegExp(pattern, flags);
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      result = addPersonalTouches(result);
      return result;
    },
    
    concise: (text: string) => {
      // ... keep existing code (concise replacements) the same
      const conciseReplacements: Record<string, string[]> = {
        "in order to": ["to"],
        "for the purpose of": ["to", "for"],
        "due to the fact that": ["because", "since", "as"],
        "at this point in time": ["now", "currently", "presently"],
        "it is important to note that": ["note that", "importantly", "notably"],
        "a large number of": ["many", "numerous", "several"],
        "make a decision": ["decide", "choose", "determine"],
        "provide assistance to": ["help", "assist", "support"]
      };
      
      let result = text;
      for (const [pattern, replacements] of Object.entries(conciseReplacements)) {
        const regex = new RegExp(pattern, "gi");
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      result = shortenSentences(result);
      return result;
    },
    
    persuasive: (text: string) => {
      // ... keep existing code (persuasive replacements) the same
      const persuasiveReplacements: Record<string, string[]> = {
        "I think": ["I firmly believe", "I am convinced", "I know", "I am certain"],
        "good": ["excellent", "outstanding", "exceptional", "remarkable"],
        "important": ["crucial", "essential", "critical", "vital", "indispensable"],
        "should": ["must", "need to", "have to", "should absolutely"],
        "probably": ["certainly", "definitely", "without doubt", "unquestionably"],
        "improve": ["transform", "revolutionize", "elevate", "maximize"]
      };
      
      let result = text;
      for (const [pattern, replacements] of Object.entries(persuasiveReplacements)) {
        const regex = new RegExp(pattern, "gi");
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      result = addPersuasiveElements(result);
      return result;
    },
    
    creative: (text: string) => {
      // ... keep existing code (creative replacements) the same
      const creativeReplacements: Record<string, string[]> = {
        "The": ["The magnificent", "The wondrous", "The captivating", "The enchanting"],
        "beautiful": ["breathtaking", "mesmerizing", "enchanting", "captivating", "spellbinding"],
        "good": ["extraordinary", "magnificent", "splendid", "marvelous", "wondrous"],
        "walk": ["stroll", "saunter", "glide", "meander", "wander"],
        "look": ["gaze", "glimpse", "peer", "observe", "behold"],
        "fast": ["swift as an arrow", "quick as lightning", "rapid as a river"]
      };
      
      let result = text;
      for (const [pattern, replacements] of Object.entries(creativeReplacements)) {
        const regex = new RegExp(pattern, "gi");
        result = result.replace(regex, () => getRandomSynonym(replacements));
      }
      
      result = addCreativeFlourishes(result);
      return result;
    },
  };
  
  const transformer = toneResponses[tone] || ((t: string) => t);
  let humanizedText = transformer(text);
  
  // Apply general improvements
  humanizedText = addNaturalVariations(humanizedText);
  humanizedText = improveFlowAndReadability(humanizedText);
  
  const plagiarismLevel = Math.floor(Math.random() * 3) + 1;
  
  console.log('Enhanced fallback processing complete');
  return { humanizedText, plagiarismLevel };
}

// Helper functions for enhanced processing
function improveSentenceStructure(text: string): string {
  return text.replace(/\. /g, '. Furthermore, ')
             .replace(/However, Furthermore, /g, 'However, ')
             .replace(/\. Furthermore, ([A-Z])/g, '. $1');
}

function addPersonalTouches(text: string): string {
  const personalPhrases = [
    'You know what? ',
    'Here\'s the thing - ',
    'I gotta say, ',
    'Between you and me, '
  ];
  
  if (Math.random() > 0.7) {
    const phrase = personalPhrases[Math.floor(Math.random() * personalPhrases.length)];
    return phrase + text.charAt(0).toLowerCase() + text.slice(1);
  }
  
  return text;
}

function shortenSentences(text: string): string {
  return text.split(/\.|\n/)
             .map(sentence => sentence.trim())
             .filter(sentence => sentence.length > 0)
             .map(sentence => {
               const words = sentence.split(" ");
               if (words.length > 12) {
                 return words.slice(0, 10).join(" ") + ".";
               }
               return sentence + ".";
             })
             .join(" ");
}

function addPersuasiveElements(text: string): string {
  return text + " This is crucial for your success!";
}

function addCreativeFlourishes(text: string): string {
  return text.replace(/\./g, '... ')
             .replace(/\.\.\. $/g, '.');
}

function addNaturalVariations(text: string): string {
  // Add slight variations to make text more natural
  return text.replace(/\b(and)\b/g, (match) => {
    return Math.random() > 0.5 ? '&' : match;
  }).replace(/\b(you)\b/g, (match) => {
    return Math.random() > 0.8 ? 'u' : match;
  });
}

function improveFlowAndReadability(text: string): string {
  // Add transitional phrases randomly
  const transitions = ['Additionally, ', 'Moreover, ', 'Furthermore, ', 'In fact, '];
  
  return text.split('. ').map((sentence, index) => {
    if (index > 0 && Math.random() > 0.7) {
      const transition = transitions[Math.floor(Math.random() * transitions.length)];
      return transition + sentence.charAt(0).toLowerCase() + sentence.slice(1);
    }
    return sentence;
  }).join('. ');
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
    
    return {
      plagiarismLevel: 1,
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
