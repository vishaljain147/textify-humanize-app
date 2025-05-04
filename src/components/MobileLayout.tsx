
import React from 'react';
import { useResponsiveUI } from '@/hooks/useResponsiveUI';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  className = '',
  fullWidth = false,
  noPadding = false
}) => {
  const { isMobile, isTablet } = useResponsiveUI();
  
  return (
    <div className={cn(
      noPadding ? '' : `${isMobile ? 'px-3 py-2' : isTablet ? 'px-6 py-3' : 'px-8 py-4'}`,
      fullWidth ? 'w-full' : 'max-w-screen-lg mx-auto',
      className
    )}>
      {children}
    </div>
  );
};

export default MobileLayout;
