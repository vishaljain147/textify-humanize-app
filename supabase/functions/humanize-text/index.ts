
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

    // Prepare system message based on tone
    let systemPrompt = "You are a helpful assistant that humanizes text.";
    
    switch (tone) {
      case "formal":
        systemPrompt += " Rewrite the following text in a formal, professional tone suitable for business communications. Use appropriate terminology, avoid contractions, and maintain a respectful distance.";
        break;
      case "friendly":
        systemPrompt += " Rewrite the following text in a warm, friendly tone as if talking to a good friend. Use casual language, contractions, and occasional emojis or exclamations where appropriate.";
        break;
      case "concise":
        systemPrompt += " Rewrite the following text to be brief and to-the-point while maintaining all important information. Remove any unnecessary words or phrases.";
        break;
      case "persuasive":
        systemPrompt += " Rewrite the following text to be convincing and persuasive. Use compelling language, rhetorical questions, and effective calls to action.";
        break;
      case "creative":
        systemPrompt += " Rewrite the following text in a creative, imaginative way. Use figurative language, vivid descriptions, and unexpected turns of phrase.";
        break;
      default:
        systemPrompt += " Rewrite the following text to sound more natural and human-written.";
    }

    console.log(`Processing text with tone: ${tone}`);
    console.log(`System prompt: ${systemPrompt.substring(0, 50)}...`);

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
        temperature: 0.7,
        max_tokens: 1000,
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
          model: "gpt-4o-mini",
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
