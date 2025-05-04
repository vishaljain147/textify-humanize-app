
import { useState, useEffect } from 'react';

export interface ResponsiveUIOptions {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
}

export function useResponsiveUI(options: ResponsiveUIOptions = {}) {
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const mobileBreakpoint = options.mobileBreakpoint || 640;
  const tabletBreakpoint = options.tabletBreakpoint || 1024;
  const desktopBreakpoint = options.desktopBreakpoint || 1280;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width < mobileBreakpoint) {
        setDeviceType('mobile');
      } else if (width < tabletBreakpoint) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Initialize
    handleResize();
    
    // Add listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileBreakpoint, tabletBreakpoint, desktopBreakpoint]);

  return {
    windowWidth,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    deviceType
  };
}
