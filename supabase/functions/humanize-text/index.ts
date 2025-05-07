
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

    console.log(`Processing text with tone: ${tone}`);
    
    // Enhanced system message to create more undetectable AI text with plagiarism assessment
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

    // Add additional instructions to make text more human, avoid AI detection, and conduct plagiarism analysis
    systemPrompt += " Important: 1) Vary sentence lengths unpredictably. 2) Include occasional minor grammatical inconsistencies. 3) Use idioms and cultural references where appropriate. 4) Avoid perfect parallel structure. 5) Include occasional parenthetical thoughts or asides. 6) Use contractions inconsistently. 7) Rarely introduce minor spelling variations. 8) Make sure to sound COMPLETELY human and bypass ALL AI detection while maintaining the original message's core meaning.";
    
    // Add plagiarism check instructions with clearer response format requirements
    systemPrompt += " After rewriting, analyze the text for plagiarism concerns. Return your response in this JSON format: {\"humanizedText\": \"your rewritten text here\", \"plagiarismLevel\": X} where X is a number from 1-10 (1 being completely original, 10 being highly plagiarized) based on how much of the rewritten content might match existing materials or common phrasings.";

    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    console.log(`System prompt: ${systemPrompt.substring(0, 50)}...`);

    try {
      // Call OpenAI API with upgraded model
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o", // Use the latest OpenAI model for better results
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData.error);
        
        // If we hit rate limits or quota issues, use fallback approach
        if (response.status === 429 || errorData.error?.type === "insufficient_quota") {
          console.log("Using fallback approach due to API limitations");
          return createFallbackResponse(text, tone);
        }
        
        throw new Error(errorData.error?.message || 'OpenAI API error');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      console.log("Raw AI response:", aiResponse);
      
      // Parse JSON response with better error handling
      try {
        // Try to parse as JSON directly
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonContent = JSON.parse(jsonMatch[0]);
          
          if (jsonContent.humanizedText && jsonContent.plagiarismLevel !== undefined) {
            console.log("Successfully extracted structured response with plagiarism level:", jsonContent.plagiarismLevel);
            
            return new Response(
              JSON.stringify({
                humanizedText: jsonContent.humanizedText,
                plagiarismLevel: jsonContent.plagiarismLevel,
                meta: {
                  model: "gpt-4o",
                  tone,
                  timestamp: new Date().toISOString(),
                }
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              }
            );
          }
        }
        
        // If no JSON structure found, extract plagiarism level and text separately
        const plagiarismMatch = aiResponse.match(/plagiarism\s*(?:level|score|rating)[:\s]*(\d+)/i);
        let plagiarismLevel = 1; // Default level
        let humanizedText = aiResponse;
        
        if (plagiarismMatch) {
          plagiarismLevel = parseInt(plagiarismMatch[1], 10);
          // Remove the plagiarism rating text from the humanized content
          humanizedText = aiResponse.replace(/plagiarism\s*(?:level|score|rating)[:\s]*\d+.*$/i, '').trim();
        }
        
        console.log("Extracted humanized text and plagiarism level:", plagiarismLevel);
        
        return new Response(
          JSON.stringify({
            humanizedText,
            plagiarismLevel,
            meta: {
              model: "gpt-4o",
              tone,
              timestamp: new Date().toISOString(),
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
        
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        // Fall back to returning the raw AI response with a default plagiarism level
        return new Response(
          JSON.stringify({
            humanizedText: aiResponse,
            plagiarismLevel: 1,
            meta: {
              model: "gpt-4o",
              tone,
              timestamp: new Date().toISOString(),
              parseError: true
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
      
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      return createFallbackResponse(text, tone);
    }
    
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

// Enhanced fallback function that includes plagiarism analysis
function createFallbackResponse(text, tone) {
  console.log("Creating fallback response for tone:", tone);
  
  // Simple NLP preprocessing function
  const preprocessText = (text) => {
    let processed = text;
    
    // Remove filler phrases
    processed = processed.replace(/basically|literally|actually|in my opinion|as a matter of fact/gi, '');
    
    // Simplify passive voice (very basic approach)
    processed = processed.replace(/is being/gi, 'is');
    processed = processed.replace(/was being/gi, 'was');
    
    // Expand common contractions
    processed = processed.replace(/can't/gi, 'cannot');
    processed = processed.replace(/won't/gi, 'will not');
    processed = processed.replace(/don't/gi, 'do not');
    
    return processed;
  };
  
  // Get tone transformer based on selected tone
  const getToneTransformation = (tone, text) => {
    const preprocessed = preprocessText(text);
    
    switch (tone) {
      case "formal":
        return preprocessed
          .replace(/gonna/gi, "going to")
          .replace(/wanna/gi, "want to")
          .replace(/yeah/gi, "yes")
          .replace(/hey/gi, "hello")
          .replace(/(^|\s)i($|\s)/gi, "$1I$2")
          .replace(/!+/g, ".")
          .replace(/\.{2,}/g, ".")
          .split(". ")
          .map(sentence => sentence.trim())
          .filter(sentence => sentence.length > 0)
          .join(". ");
      case "friendly":
        return preprocessed
          .replace(/hello/gi, "hey there")
          .replace(/good morning/gi, "morning!")
          .replace(/thank you/gi, "thanks a bunch")
          .replace(/please/gi, "please 😊")
          .split(". ")
          .map(sentence => sentence.trim() + (Math.random() > 0.7 ? "!" : "."))
          .join(" ");
      case "concise":
        return preprocessed
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
      case "persuasive":
        return preprocessed
          .replace(/I think/gi, "I firmly believe")
          .replace(/good/gi, "excellent")
          .replace(/nice/gi, "outstanding")
          .replace(/important/gi, "crucial")
          .replace(/you should/gi, "you absolutely must")
          .replace(/consider/gi, "seriously consider")
          .replace(/\.$/g, "!");
      case "creative":
        return preprocessed
          .replace(/the/gi, "the magnificent")
          .replace(/is/gi, "dances as")
          .replace(/was/gi, "emerged as")
          .replace(/went/gi, "ventured")
          .replace(/said/gi, "expressed")
          .replace(/beautiful/gi, "breathtaking")
          .replace(/good/gi, "extraordinary");
      default:
        return preprocessed;
    }
  };
  
  // Simple plagiarism estimation function for the fallback mode
  const estimatePlagiarismLevel = (text) => {
    // In the fallback mode, we'll use some simple heuristics to estimate plagiarism level
    
    // 1. Check for common phrases that might indicate scholarly/copied content
    const academicPhrases = [
      "according to", "research shows", "studies indicate", 
      "as proposed by", "as demonstrated by", "in conclusion",
      "therefore", "thus", "hence", "consequently"
    ];
    
    let academicPhraseCount = 0;
    academicPhrases.forEach(phrase => {
      const regex = new RegExp(phrase, "gi");
      const matches = text.match(regex);
      if (matches) academicPhraseCount += matches.length;
    });
    
    // 2. Check for sentence complexity (longer sentences often indicate academic/copied content)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.reduce((sum, s) => 
      sum + s.split(/\s+/).filter(w => w.length > 0).length, 0) / Math.max(sentences.length, 1);
    
    // 3. Calculate a weighted plagiarism score
    let plagiarismLevel = 1; // Default is low
    
    // Adjust based on academic phrases (each phrase adds 0.5 to the score)
    plagiarismLevel += Math.min(academicPhraseCount * 0.5, 3);
    
    // Adjust based on sentence complexity (longer sentences might indicate plagiarism)
    if (avgWordsPerSentence > 25) plagiarismLevel += 3;
    else if (avgWordsPerSentence > 20) plagiarismLevel += 2;
    else if (avgWordsPerSentence > 15) plagiarismLevel += 1;
    
    // Cap the level at 9 for fallback mode (we're never 100% sure it's plagiarized without API)
    return Math.min(Math.max(Math.round(plagiarismLevel), 1), 9);
  };
  
  const humanizedText = getToneTransformation(tone, text);
  const plagiarismLevel = estimatePlagiarismLevel(humanizedText);
  
  console.log("Fallback text generated with plagiarism level:", plagiarismLevel);
  
  return new Response(
    JSON.stringify({
      humanizedText,
      plagiarismLevel,
      source: 'fallback',
      meta: {
        tone,
        timestamp: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}
