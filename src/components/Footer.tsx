
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Textify AI Humanizer. All rights reserved.
          </p>
        </div>
        <div className="flex flex-row gap-4 text-sm text-muted-foreground">
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
