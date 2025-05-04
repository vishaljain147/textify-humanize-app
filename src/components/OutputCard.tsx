
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Copy, Heart, Share } from "lucide-react";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";

type OutputCardProps = {
  output: string;
  tone: string;
  timestamp?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
};

export default function OutputCard({ 
  output, 
  tone, 
  timestamp = new Date().toLocaleString(),
  isFavorite = false,
  onFavoriteToggle
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
