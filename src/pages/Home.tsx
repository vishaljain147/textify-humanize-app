
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import ToneSelector from "@/components/ToneSelector";
import OutputCard from "@/components/OutputCard";
import { humanizeText, saveTextEntry } from "@/lib/api";
import { ArrowRight, Loader2 } from "lucide-react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      toast("Please enter some text to humanize");
      return;
    }
    
    setIsLoading(true);
    setShowOutput(false);
    
    try {
      const response = await humanizeText({ text: inputText, tone: selectedTone });
      setOutputText(response.humanizedText);
      setShowOutput(true);
      
      // Save to history
      saveTextEntry({
        originalText: inputText,
        humanizedText: response.humanizedText,
        tone: selectedTone,
        isFavorite: false
      });
      
    } catch (error) {
      console.error("Error humanizing text:", error);
      toast("Failed to humanize text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
        <span className="bg-gradient-to-r from-humanize-600 to-humanize-800 text-transparent bg-clip-text">
          Textify AI Humanizer
        </span>
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Transform robotic text into natural, human-like content
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Your Text</CardTitle>
          <CardDescription>
            Paste in text that sounds robotic or AI-generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              placeholder="Enter the text you want to humanize..."
              className="min-h-32"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <ToneSelector 
              selectedTone={selectedTone} 
              onChange={setSelectedTone} 
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || !inputText.trim()} 
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Humanizing...
                  </>
                ) : (
                  <>
                    Humanize Text
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {showOutput && (
        <div className="mb-8">
          <OutputCard 
            output={outputText} 
            tone={selectedTone}
          />
        </div>
      )}
      
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">
            Textify uses advanced AI to transform robotic text into natural, human-like content
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Input Text</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Enter AI-generated or robotic-sounding text that needs humanizing
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Choose Tone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select from multiple tone options to match your desired style
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Get Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Receive naturally-sounding text that you can copy, save or share
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
