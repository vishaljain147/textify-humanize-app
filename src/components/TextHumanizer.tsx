import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ToneSelector from "@/components/ToneSelector";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { humanizeText, saveTextEntry } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";

export default function TextHumanizer() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { isMobile } = useResponsiveUI();

  const preprocessText = (text: string): string => {
    // Simple NLP preprocessing
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
    
    return processed.trim();
  };

  const handleSubmit = async () => {
    if (!inputText) {
      toast("Please enter some text to humanize");
      return;
    }

    setIsProcessing(true);
    
    try {
      const preprocessedText = preprocessText(inputText);
      
      // Use the API service to humanize the text
      const result = await humanizeText({
        text: preprocessedText,
        tone: selectedTone
      });
      
      setOutputText(result.humanizedText);

      // Save to database if logged in
      if (user) {
        const { data, error } = await supabase.from('text_entries').insert({
          user_id: user.id,
          original_text: inputText,
          humanized_text: result.humanizedText,
          tone: selectedTone
        });
        
        if (error) {
          console.error('Error saving text entry:', error);
        }
      } else {
        // Save locally if not logged in
        saveTextEntry({
          originalText: inputText,
          humanizedText: result.humanizedText,
          tone: selectedTone,
          isFavorite: false
        });
      }
      
      toast("Text successfully humanized!");
    } catch (error) {
      console.error('Error humanizing text:', error);
      toast("Failed to humanize text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!outputText) {
      toast("No text to copy");
      return;
    }
    
    navigator.clipboard.writeText(outputText)
      .then(() => toast("Copied to clipboard"))
      .catch(err => {
        console.error('Error copying text:', err);
        toast("Failed to copy text");
      });
  };

  return (
    <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-6 max-w-6xl mx-auto`}>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Original Text</h2>
            <Textarea
              placeholder="Enter your text here..."
              className="min-h-[150px] md:min-h-[200px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="space-y-4">
              <ToneSelector selectedTone={selectedTone} onChange={setSelectedTone} />
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={isProcessing || !inputText}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Humanize Text"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Humanized Text</h2>
            <Textarea
              placeholder="Humanized text will appear here..."
              className="min-h-[150px] md:min-h-[200px]"
              value={outputText}
              readOnly
            />
            <div>
              <Button 
                onClick={handleCopyToClipboard} 
                variant="outline" 
                className="w-full"
                disabled={!outputText}
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
