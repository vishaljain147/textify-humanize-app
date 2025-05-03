
import { useAuth } from "@/contexts/AuthContext";
import TextHumanizer from "@/components/TextHumanizer";

export default function Home() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">AI Text Humanizer</h1>
          <p className="text-lg text-muted-foreground">
            Transform robotic or AI-generated text into natural, human-like writing
          </p>
        </div>
        
        <TextHumanizer />
      </div>
    </div>
  );
}
