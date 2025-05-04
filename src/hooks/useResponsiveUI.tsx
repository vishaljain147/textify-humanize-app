
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export interface ResponsiveUIOptions {
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

export function useResponsiveUI(options: ResponsiveUIOptions = {}) {
  const isMobile = useIsMobile();
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const mobileBreakpoint = options.mobileBreakpoint || 768;
  const tabletBreakpoint = options.tabletBreakpoint || 1024;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
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
  }, [mobileBreakpoint, tabletBreakpoint]);

  return {
    isMobile,
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    deviceType
  };
}
