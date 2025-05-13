
import { useAuth } from "@/contexts/AuthContext";
import TextHumanizer from "@/components/TextHumanizer";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";
import { Capacitor } from '@capacitor/core';

export default function Home() {
  const { user, isLoading } = useAuth();
  const { isMobile } = useResponsiveUI();
  const isNative = Capacitor.isNativePlatform();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-4 md:py-8 ${isNative ? 'safe-area-inset' : ''}`}>
      <div className="space-y-4 md:space-y-8">
        <div className="text-center space-y-2">
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold`}>
            AI Text Humanizer
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground">
            Transform AI text into natural, human writing
          </p>
          {!isMobile && (
            <div className="bg-blue-50 text-blue-700 rounded-md p-2 mt-2 text-sm inline-block">
              Now featuring Undetectable AI's plagiarism detection
            </div>
          )}
        </div>
        
        <TextHumanizer />
      </div>
    </div>
  );
}
