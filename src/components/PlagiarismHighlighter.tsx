
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Check, AlertCircle } from "lucide-react";

interface PlagiarizedSection {
  text: string;
  score: number;
  startIndex: number;
  endIndex: number;
}

interface PlagiarismHighlighterProps {
  text: string;
  plagiarismLevel: number;
  plagiarizedSections: PlagiarizedSection[];
  showDetailed?: boolean;
}

export default function PlagiarismHighlighter({
  text,
  plagiarismLevel,
  plagiarizedSections,
  showDetailed = false
}: PlagiarismHighlighterProps) {
  
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
    if (level <= 7) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  // Highlight the text with plagiarized sections if detailed view is enabled
  const renderHighlightedText = () => {
    if (!showDetailed || plagiarizedSections.length === 0) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }

    // Sort sections by start index to process them in order
    const sortedSections = [...plagiarizedSections].sort((a, b) => a.startIndex - b.startIndex);
    
    const textParts = [];
    let lastIndex = 0;
    
    sortedSections.forEach((section, index) => {
      // Add non-plagiarized text before this section
      if (section.startIndex > lastIndex) {
        textParts.push(
          <span key={`clean-${index}`}>
            {text.substring(lastIndex, section.startIndex)}
          </span>
        );
      }
      
      // Add the plagiarized section with highlighting
      const highlightColor = section.score > 0.7 ? "bg-red-100" : "bg-yellow-100";
      textParts.push(
        <span 
          key={`plagiarized-${index}`} 
          className={`${highlightColor} rounded px-1 border-l-2 border-red-500`}
          title={`Plagiarism score: ${Math.round(section.score * 100)}%`}
        >
          {text.substring(section.startIndex, section.endIndex)}
        </span>
      );
      
      lastIndex = section.endIndex;
    });
    
    // Add any remaining text after the last plagiarized section
    if (lastIndex < text.length) {
      textParts.push(
        <span key="clean-last">
          {text.substring(lastIndex)}
        </span>
      );
    }
    
    return <div className="whitespace-pre-wrap">{textParts}</div>;
  };

  return (
    <div className="space-y-2">
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
      
      <p className="text-xs text-muted-foreground">
        {plagiarismLevel <= 3 
          ? "This text appears highly original and unique." 
          : plagiarismLevel <= 6 
            ? "This text contains some common phrases but is mostly original." 
            : "This text contains significant portions that match existing content."}
      </p>
      
      {showDetailed && plagiarizedSections.length > 0 && (
        <Card className="mt-3">
          <CardContent className="p-3">
            <h4 className="text-sm font-semibold mb-2">Detailed Plagiarism Analysis</h4>
            {renderHighlightedText()}
            
            <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
              <p>We found {plagiarizedSections.length} potentially plagiarized {plagiarizedSections.length === 1 ? 'section' : 'sections'}.</p>
              <p>Highlighted sections may match existing published content.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
