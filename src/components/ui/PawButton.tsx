import React from 'react';
import { PawPrint } from 'lucide-react';

interface PawButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const PawButton: React.FC<PawButtonProps> = ({ children, ...props }) => {
  return (
    <button className="paw-button" {...props}>
      <PawPrint size={18} />
      {children}
    </button>
  );
};
