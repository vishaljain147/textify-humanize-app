
// Mock API service to simulate text humanization

interface HumanizeTextRequest {
  text: string;
  tone: string;
}

interface HumanizeTextResponse {
  humanizedText: string;
}

// Mock delay function
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Mock responses based on tone
const toneResponses: Record<string, (text: string) => string> = {
  formal: (text: string) => {
    return text
      .replace(/gonna/gi, "going to")
      .replace(/wanna/gi, "want to")
      .replace(/yeah/gi, "yes")
      .replace(/hey/gi, "hello")
      .replace(/(^|\s)i($|\s)/gi, "$1I$2")
      .replace(/!+/g, ".")
      .replace(/\.{2,}/g, ".");
  },
  friendly: (text: string) => {
    return text
      .replace(/\./g, "! ")
      .replace(/Hello/gi, "Hey there")
      .replace(/Good morning/gi, "Morning!")
      .replace(/Thank you/gi, "Thanks a bunch")
      .replace(/Please/gi, "Please 😊")
      .trim();
  },
  concise: (text: string) => {
    return text
      .split(/\.|\n/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => {
        const words = sentence.split(" ");
        if (words.length > 8) {
          return words.slice(0, 8).join(" ") + ".";
        }
        return sentence + ".";
      })
      .join(" ");
  },
  persuasive: (text: string) => {
    return text
      .replace(/I think/gi, "I firmly believe")
      .replace(/good/gi, "excellent")
      .replace(/nice/gi, "outstanding")
      .replace(/important/gi, "crucial")
      .replace(/You should/gi, "You absolutely must")
      .replace(/consider/gi, "seriously consider")
      .replace(/\.$/g, "!");
  },
  creative: (text: string) => {
    return text
      .replace(/The/gi, "The magnificent")
      .replace(/is/gi, "dances as")
      .replace(/was/gi, "emerged as")
      .replace(/went/gi, "ventured")
      .replace(/said/gi, "expressed")
      .replace(/beautiful/gi, "breathtaking")
      .replace(/good/gi, "extraordinary");
  },
};

export async function humanizeText(request: HumanizeTextRequest): Promise<HumanizeTextResponse> {
  // Simulate API delay
  await delay(1500);
  
  const { text, tone } = request;
  
  // Get tone transformer or default to identity function
  const transformer = toneResponses[tone] || ((t: string) => t);
  
  // Transform the text
  const humanizedText = transformer(text);
  
  return { humanizedText };
}

// History storage in localStorage
export interface TextEntry {
  id: string;
  originalText: string;
  humanizedText: string;
  tone: string;
  timestamp: string;
  isFavorite: boolean;
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
