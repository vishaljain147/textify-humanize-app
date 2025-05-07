
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, Heart, Share, AlertTriangle, Check } from "lucide-react";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";
import { Progress } from "@/components/ui/progress";

type OutputCardProps = {
  output: string;
  tone: string;
  timestamp?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  plagiarismLevel?: number;
};

export default function OutputCard({ 
  output, 
  tone, 
  timestamp = new Date().toLocaleString(),
  isFavorite = false,
  onFavoriteToggle,
  plagiarismLevel
}: OutputCardProps) {
  const { isMobile } = useResponsiveUI();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast("Copied to clipboard");
  };
  
  const shareOutput = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Textify Humanized Text',
          text: output
        });
        toast("Shared successfully");
      } catch (error) {
        console.error('Error sharing:', error);
        toast("Couldn't share content");
      }
    } else {
      toast("Web Share API not supported on this browser");
    }
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
    <Card className="w-full">
      <CardHeader className={isMobile ? "px-4 py-3" : ""}>
        <CardTitle className="flex justify-between items-center">
          <span className="text-sm md:text-base">Humanized Text ({tone})</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 py-2" : ""}>
        <p className="whitespace-pre-wrap">{output}</p>
        
        {plagiarismLevel !== undefined && (
          <div className="mt-4 space-y-2 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {getPlagiarismIcon(plagiarismLevel)}
                <span className="text-sm">Plagiarism: <span className="font-medium">{getPlagiarismLevelText(plagiarismLevel)}</span></span>
              </div>
              <span className="text-xs">{plagiarismLevel}/10</span>
            </div>
            <Progress 
              value={plagiarismLevel * 10} 
              className={`h-1.5 ${getPlagiarismLevelColor(plagiarismLevel)}`}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className={`flex justify-end space-x-2 ${isMobile ? "px-4 py-3" : ""}`}>
        {onFavoriteToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onFavoriteToggle}
            className={isFavorite ? "text-destructive" : ""}
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Favorite</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
          <span className="sr-only">Copy</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={shareOutput}>
          <Share className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
