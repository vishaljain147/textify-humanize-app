
import { useAuth } from "@/contexts/AuthContext";
import TextHumanizer from "@/components/TextHumanizer";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, Shield, Clock, BrainCircuit } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { isMobile } = useResponsiveUI();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="space-y-6 md:space-y-8">
        <div className="text-center space-y-2">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold`}>AI Text Humanizer</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Transform robotic or AI-generated text into natural, human-like writing with plagiarism detection
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <h3 className="font-medium">AI Detection Bypass</h3>
                <p className="text-sm text-muted-foreground">Creates text that passes AI detection tools</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="font-medium">Plagiarism Analysis</h3>
                <p className="text-sm text-muted-foreground">Checks content originality with detailed score</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <Clock className="h-8 w-8 text-primary" />
                <h3 className="font-medium">Instant Processing</h3>
                <p className="text-sm text-muted-foreground">Transform your content in seconds</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <ClipboardCheck className="h-8 w-8 text-primary" />
                <h3 className="font-medium">Multiple Tones</h3>
                <p className="text-sm text-muted-foreground">Formal, friendly, creative and more options</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <TextHumanizer />
      </div>
    </div>
  );
}
