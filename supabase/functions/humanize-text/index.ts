
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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

    // Enhanced system message to create more undetectable AI text
    let systemPrompt = "You are an expert human writer tasked with making text sound authentically human and completely undetectable by AI detection tools. ";
    
    switch (tone) {
      case "formal":
        systemPrompt += "Rewrite the following text in a formal, professional tone suitable for business communications. Use appropriate terminology, vary sentence structures significantly, incorporate occasional imperfections, and maintain a respectful distance. Avoid repetitive phrases and predictable language patterns.";
        break;
      case "friendly":
        systemPrompt += "Rewrite the following text in a warm, friendly tone as if talking to a good friend. Use casual language, contractions, slang, occasional grammatical liberties, and typical human speech patterns including filler words. Add personal touches, conversational asides, and stream-of-consciousness elements occasionally.";
        break;
      case "concise":
        systemPrompt += "Rewrite the following text to be brief and to-the-point while maintaining all important information. Remove unnecessary words but preserve a natural human cadence. Vary your approach to summarization rather than following formulaic patterns.";
        break;
      case "persuasive":
        systemPrompt += "Rewrite the following text to be convincing and persuasive. Use compelling language, rhetorical questions, emotional appeals, and effective calls to action. Incorporate irregular emphasis patterns that a human would use rather than perfectly balanced arguments.";
        break;
      case "creative":
        systemPrompt += "Rewrite the following text in a creative, imaginative way. Use figurative language, vivid descriptions, unexpected turns of phrase, and occasional unique word choices. Incorporate the natural quirks and inconsistencies of human creative writing.";
        break;
      default:
        systemPrompt += "Rewrite the following text to sound perfectly human and completely undetectable by AI detection tools. Introduce natural variations, irregularities, occasional minor errors, and the organic unpredictability of human writing.";
    }

    // Add additional instructions to make text more human and avoid AI detection
    systemPrompt += " Important: 1) Vary sentence lengths unpredictably. 2) Include occasional minor grammatical inconsistencies. 3) Use idioms and cultural references where appropriate. 4) Avoid perfect parallel structure. 5) Include occasional parenthetical thoughts or asides. 6) Use contractions inconsistently. 7) Rarely introduce minor spelling variations. 8) Make sure to sound COMPLETELY human and bypass ALL AI detection while maintaining the original message's core meaning.";
    
    console.log(`Processing text with tone: ${tone}`);
    console.log(`System prompt: ${systemPrompt.substring(0, 50)}...`);

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Call OpenAI API with upgraded model
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o", // Upgraded to more powerful model for better undetectable text
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.9, // Higher temperature for more creative and varied outputs
        max_tokens: 2000, // Increased token limit for longer responses
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const humanizedText = data.choices[0].message.content;
    console.log("Successfully humanized text");

    return new Response(
      JSON.stringify({
        humanizedText,
        meta: {
          model: "gpt-4o", // Updated model name in response
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
});
