
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UNDETECTABLE_API_KEY = Deno.env.get('UNDETECTABLE_AI');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    if (!UNDETECTABLE_API_KEY) {
      throw new Error('Undetectable AI API key is not configured');
    }

    console.log(`Processing plagiarism check for text: ${text.substring(0, 50)}...`);

    // Call Undetectable AI API
    const response = await fetch("https://api.undetectable.ai/detect/", {
      method: "POST",
      headers: {
        "X-API-Key": UNDETECTABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Undetectable AI API error:", errorData);
      throw new Error(`Undetectable AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Plagiarism detection result:", JSON.stringify(data).substring(0, 200) + "...");
    
    // Extract plagiarism sections and score
    const plagiarismScore = Math.round((data.score || 0) * 10); // Convert 0-1 score to 0-10
    let plagiarizedSections = [];
    
    // Logic to identify plagiarized sections based on the API response
    // This is a simplified approach - adjust based on actual API response format
    if (data.sentences) {
      plagiarizedSections = data.sentences
        .filter(sentence => sentence.score > 0.5) // Threshold for flagging a sentence
        .map(sentence => ({
          text: sentence.text,
          score: sentence.score,
          startIndex: sentence.start_index || 0,
          endIndex: sentence.end_index || 0
        }));
    }

    return new Response(
      JSON.stringify({
        plagiarismLevel: plagiarismScore,
        plagiarizedSections: plagiarizedSections,
        originalScore: data.score || 0,
        meta: {
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
