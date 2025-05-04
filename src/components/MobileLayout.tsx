
import React from 'react';
import { useResponsiveUI } from '@/hooks/useResponsiveUI';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
  const { isMobile } = useResponsiveUI();
  
  return (
    <div className={`${isMobile ? 'px-4 py-2' : 'px-8 py-4'} max-w-screen-lg mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default MobileLayout;
