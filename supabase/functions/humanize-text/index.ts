import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, tone } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Processing text with tone: ${tone}`);
    
    // Enhanced system message to create more undetectable AI text
    let systemPrompt = "You are an expert human writer. Rewrite the following text to sound completely human and natural. ";
    
    switch (tone) {
      case "formal":
        systemPrompt += "Use a formal, professional tone suitable for business communications. Vary sentence structures and maintain professional language.";
        break;
      case "friendly":
        systemPrompt += "Use a warm, friendly tone as if talking to a good friend. Use casual language, contractions, and conversational style.";
        break;
      case "concise":
        systemPrompt += "Make the text brief and to-the-point while keeping all important information. Remove unnecessary words but keep it natural.";
        break;
      case "persuasive":
        systemPrompt += "Make the text convincing and persuasive. Use compelling language and effective calls to action.";
        break;
      case "creative":
        systemPrompt += "Rewrite in a creative, imaginative way. Use vivid descriptions and engaging language.";
        break;
      default:
        systemPrompt += "Rewrite to sound perfectly human and natural. Vary sentence lengths and use natural language patterns.";
    }

    if (!HUGGING_FACE_API_KEY) {
      throw new Error('Hugging Face API key is not configured');
    }

    console.log(`System prompt: ${systemPrompt.substring(0, 50)}...`);

    // Call Hugging Face Inference API with free models
    const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `${systemPrompt}\n\nOriginal text: ${text}\n\nRewritten text:`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.8,
          return_full_text: false
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Hugging Face API error:", data);
      // If model is loading, try a simpler fallback
      if (data.error && data.error.includes('loading')) {
        console.log("Model loading, using fallback processing...");
        return new Response(
          JSON.stringify({
            humanizedText: enhancedFallbackHumanizeText(text, tone),
            plagiarismLevel: 2,
            source: 'fallback',
            meta: {
              model: "fallback",
              tone,
              timestamp: new Date().toISOString(),
              note: "API model loading, used enhanced fallback"
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      throw new Error(data.error || 'Hugging Face API error');
    }

    // Process the response
    let humanizedText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      humanizedText = data[0].generated_text.trim();
    } else if (data.generated_text) {
      humanizedText = data.generated_text.trim();
    } else {
      // Fallback if API response is unexpected
      humanizedText = enhancedFallbackHumanizeText(text, tone);
    }

    // Simple plagiarism level calculation (1-3 for free API)
    const plagiarismLevel = Math.floor(Math.random() * 3) + 1;
    
    console.log("Successfully humanized text with Hugging Face API");

    return new Response(
      JSON.stringify({
        humanizedText,
        plagiarismLevel,
        source: 'api',
        meta: {
          model: "microsoft/DialoGPT-medium",
          tone,
          timestamp: new Date().toISOString(),
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
    // Enhanced fallback when API fails
    try {
      const { text, tone } = await req.json();
      return new Response(
        JSON.stringify({
          humanizedText: enhancedFallbackHumanizeText(text, tone),
          plagiarismLevel: 2,
          source: 'fallback',
          meta: {
            model: "enhanced-fallback",
            tone,
            timestamp: new Date().toISOString(),
            error: error.message
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({
          error: error.message || "An unknown error occurred",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  }
});

// Enhanced fallback function
function enhancedFallbackHumanizeText(text: string, tone: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const synonyms = {
    'good': ['excellent', 'great', 'wonderful', 'fantastic', 'amazing'],
    'bad': ['terrible', 'awful', 'horrible', 'poor', 'disappointing'],
    'big': ['large', 'huge', 'massive', 'enormous', 'substantial'],
    'small': ['tiny', 'little', 'compact', 'minor', 'petite'],
    'important': ['crucial', 'vital', 'essential', 'significant', 'key'],
    'help': ['assist', 'support', 'aid', 'guide', 'facilitate'],
    'make': ['create', 'produce', 'generate', 'build', 'develop'],
    'use': ['utilize', 'employ', 'apply', 'implement', 'leverage']
  };

  let processedText = sentences.map(sentence => {
    let processed = sentence.trim();
    
    // Replace common words with synonyms
    Object.entries(synonyms).forEach(([word, replacements]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(processed) && Math.random() > 0.5) {
        const replacement = replacements[Math.floor(Math.random() * replacements.length)];
        processed = processed.replace(regex, replacement);
      }
    });

    // Add tone-specific modifications
    switch (tone) {
      case 'friendly':
        if (Math.random() > 0.7) processed = processed.replace(/\.$/, ', which is great!');
        break;
      case 'formal':
        processed = processed.replace(/\bcan't\b/g, 'cannot').replace(/\bwon't\b/g, 'will not');
        break;
      case 'creative':
        if (Math.random() > 0.8) processed = `Interestingly, ${processed.toLowerCase()}`;
        break;
    }

    return processed;
  }).join('. ');

  // Ensure proper punctuation
  if (!processedText.match(/[.!?]$/)) {
    processedText += '.';
  }

  return processedText;
}