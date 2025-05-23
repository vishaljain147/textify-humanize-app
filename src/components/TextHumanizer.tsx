
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ToneSelector from "@/components/ToneSelector";
import { toast } from "@/components/ui/sonner";
import { Loader2, RefreshCw, AlertTriangle, Check, FileSearch } from "lucide-react";
import { humanizeText, saveTextEntry, checkPlagiarism, PlagiarismResult } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";
import { Progress } from "@/components/ui/progress";
import PlagiarismHighlighter from './PlagiarismHighlighter';

export default function TextHumanizer() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTone, setSelectedTone] = useState('formal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [responseStats, setResponseStats] = useState<{
    processingTime?: number;
    source?: 'api' | 'fallback';
    wordCount?: { original: number; humanized: number };
    similarity?: number;
    plagiarismLevel?: number;
  } | null>(null);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [showDetailedPlagiarism, setShowDetailedPlagiarism] = useState(false);
  
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

  // Calculate similarity score (Jaccard similarity) between original and humanized text
  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async () => {
    if (!inputText) {
      toast("Please enter some text to humanize");
      return;
    }

    setIsProcessing(true);
    setResponseStats(null);
    setPlagiarismResult(null);
    setShowDetailedPlagiarism(false);
    
    const startTime = performance.now();
    
    try {
      const preprocessedText = preprocessText(inputText);
      
      // Use the API service to humanize the text
      const result = await humanizeText({
        text: preprocessedText,
        tone: selectedTone
      });
      
      setOutputText(result.humanizedText);

      // Calculate stats
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);
      const similarity = calculateSimilarity(inputText, result.humanizedText);
      const wordCount = {
        original: countWords(inputText),
        humanized: countWords(result.humanizedText)
      };
      
      setResponseStats({
        processingTime,
        source: result.source || 'api',
        wordCount,
        similarity,
        plagiarismLevel: result.plagiarismLevel || 1
      });

      // Save to database if logged in
      if (user) {
        const { data, error } = await supabase.from('text_entries').insert({
          user_id: user.id,
          original_text: inputText,
          humanized_text: result.humanizedText,
          tone: selectedTone,
          plagiarism_level: result.plagiarismLevel || 1
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
          isFavorite: false,
          plagiarismLevel: result.plagiarismLevel || 1
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

  const handleDetailedPlagiarismCheck = async () => {
    if (!outputText) {
      toast("No text to check for plagiarism");
      return;
    }
    
    setIsCheckingPlagiarism(true);
    
    try {
      const result = await checkPlagiarism(outputText);
      setPlagiarismResult(result);
      setShowDetailedPlagiarism(true);
      
      if (result.plagiarismLevel <= 3) {
        toast("Great! Your text appears to be highly original.");
      } else if (result.plagiarismLevel <= 6) {
        toast("Your text contains some common phrases but is mostly original.");
      } else {
        toast("Warning: Your text may contain significant plagiarism.", {
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        });
      }
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      toast("Failed to check plagiarism. Please try again.");
    } finally {
      setIsCheckingPlagiarism(false);
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
  
  const getPlagiarismLevelColor = (level: number) => {
    if (level <= 3) return "bg-green-500";
    if (level <= 6) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getPlagiarismLevelText = (level: number) => {
    if (level <= 2) return "Very Low";
    if (level <= 4) return "Low";
    if (level <= 6) return "Moderate";
    if (level <= 8) return "High";
    return "Very High";
  };
  
  const getPlagiarismIcon = (level: number) => {
    if (level <= 4) return <Check className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Humanized Text</h2>
              {responseStats && (
                <div className="text-xs text-muted-foreground">
                  {responseStats.source === 'fallback' ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">
                      Fallback Mode
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">
                      API Mode
                    </span>
                  )}
                </div>
              )}
            </div>
            <Textarea
              placeholder="Humanized text will appear here..."
              className="min-h-[150px] md:min-h-[200px]"
              value={outputText}
              readOnly
            />
            
            {responseStats && (
              <div className="text-sm border rounded-md p-3 bg-muted/50 space-y-3">
                <h3 className="font-medium mb-1">Analysis</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Processing time: <span className="font-medium">{responseStats.processingTime}ms</span></div>
                  <div>Similarity: <span className="font-medium">{Math.round(responseStats.similarity! * 100)}%</span></div>
                  <div>Original words: <span className="font-medium">{responseStats.wordCount?.original}</span></div>
                  <div>Humanized words: <span className="font-medium">{responseStats.wordCount?.humanized}</span></div>
                </div>
                
                {plagiarismResult ? (
                  <div className="space-y-2 pt-1 border-t">
                    <PlagiarismHighlighter 
                      text={outputText}
                      plagiarismLevel={plagiarismResult.plagiarismLevel}
                      plagiarizedSections={plagiarismResult.plagiarizedSections}
                      showDetailed={showDetailedPlagiarism}
                    />
                  </div>
                ) : responseStats.plagiarismLevel !== undefined && (
                  <div className="space-y-2 pt-1 border-t">
                    <PlagiarismHighlighter 
                      text={outputText}
                      plagiarismLevel={responseStats.plagiarismLevel}
                      plagiarizedSections={[]}
                      showDetailed={false}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCopyToClipboard} 
                variant="outline" 
                className="flex-1"
                disabled={!outputText}
              >
                Copy to Clipboard
              </Button>
              {outputText && !isCheckingPlagiarism && !showDetailedPlagiarism && (
                <Button
                  onClick={handleDetailedPlagiarismCheck}
                  variant="outline"
                  className="flex items-center gap-1"
                  disabled={isProcessing || isCheckingPlagiarism}
                >
                  {isCheckingPlagiarism ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSearch className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Check Plagiarism</span>
                </Button>
              )}
              {outputText && (
                <Button
                  onClick={handleSubmit}
                  variant="outline"
                  size="icon"
                  title="Retry humanization"
                  disabled={isProcessing}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
