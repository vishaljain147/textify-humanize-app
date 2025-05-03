
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast("Successfully signed out");
      navigate('/');
    } catch (error) {
      toast("Error signing out");
      console.error("Sign out error:", error);
    }
  };

  const getUserInitials = () => {
    if (!user || !user.email) return "?";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="border-b border-border">
      <div className="container max-w-6xl mx-auto flex justify-between items-center h-16 px-4">
        <Link to="/" className="text-xl font-bold">Textify</Link>
        
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/home" className="text-sm hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/history" className="text-sm hover:text-primary transition-colors">
            History
          </Link>
          <Link to="/settings" className="text-sm hover:text-primary transition-colors">
            Settings
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:opacity-80">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
