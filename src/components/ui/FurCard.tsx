import React from 'react';

export const FurCard: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => {
  return (
    <div className={`fur-card ${className}`} style={style}>
      {children}
    </div>
  );
};
