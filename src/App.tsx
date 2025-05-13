
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import MobileLayout from "./components/MobileLayout";
import { useEffect } from "react";
import { Capacitor } from '@capacitor/core';

const queryClient = new QueryClient();

const App = () => {
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNative) {
      // Add specific body class for mobile app
      document.body.classList.add('capacitor-app');
      
      // Set meta viewport for mobile
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 
          'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no'
        );
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className={`flex flex-col min-h-screen ${isNative ? 'capacitor-container' : ''}`}>
              <Header />
              <main className="flex-1">
                <MobileLayout safeArea={isNative}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MobileLayout>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
