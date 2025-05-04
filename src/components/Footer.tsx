
import { Link } from "react-router-dom";
import { useResponsiveUI } from "@/hooks/useResponsiveUI";

export default function Footer() {
  const { isMobile } = useResponsiveUI();
  
  return (
    <footer className="border-t py-4 md:py-6">
      <div className={`container flex ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-between gap-4`}>
        <div className="flex flex-col items-center gap-1 md:items-start">
          <p className="text-center text-xs md:text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Textify AI Humanizer. All rights reserved.
          </p>
        </div>
        <div className="flex flex-row gap-4 text-xs md:text-sm text-muted-foreground">
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="underline hover:text-foreground">
            Terms
          </Link>
          <Link to="/contact" className="underline hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
