
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

// Initialize Capacitor plugins if running on a native platform
if (Capacitor.isNativePlatform()) {
  // Hide the splash screen with a fade animation
  SplashScreen.hide({
    fadeOutDuration: 500
  });
  
  // Set status bar style
  StatusBar.setStyle({ style: 'light' });
  
  // Set keyboard behavior
  Keyboard.setAccessoryBarVisible({ isVisible: false });
  Keyboard.setResizeMode({ mode: 'body' });
  
  console.log('Running on platform:', Capacitor.getPlatform());
}

createRoot(document.getElementById("root")!).render(<App />);
