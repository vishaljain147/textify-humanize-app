
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5239ce5077974b2f8a600d008601abed',
  appName: 'textify-humanize-app',
  webDir: 'dist',
  server: {
    url: 'https://5239ce50-7797-4b2f-8a60-0d008601abed.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: false
    },
    Keyboard: {
      resize: "body",
      style: "light"
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#10b981"
    }
  }
};

export default config;
