
import React from 'react';
import { Link } from 'react-router-dom';
import { useResponsiveUI } from '@/hooks/useResponsiveUI';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Home, History, Settings, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const { isMobile } = useResponsiveUI();
  const { user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const menuItems = [
    { to: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
    { to: '/history', label: 'History', icon: <History className="h-4 w-4 mr-2" /> },
    { to: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> }
  ];
  
  const MobileMenu = () => (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.to}
                variant="ghost"
                className="justify-start"
                asChild
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to={item.to} className="flex items-center">
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="mt-auto">
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center">
        {isMobile ? (
          <>
            <MobileMenu />
            <div className="flex-1 flex justify-center">
              <Link to="/" className="font-semibold">
                Textify
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Textify</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {menuItems.map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex-1"></div>
          </>
        )}
        
        <div className="flex items-center">
          {!isMobile && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
