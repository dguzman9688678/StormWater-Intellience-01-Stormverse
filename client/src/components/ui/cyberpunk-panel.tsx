import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CyberpunkPanelProps {
  title: string;
  children: ReactNode;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export default function CyberpunkPanel({ 
  title, 
  children, 
  position, 
  className 
}: CyberpunkPanelProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={cn(
      "cyber-panel",
      positionClasses[position],
      className
    )}>
      <div className="panel-border">
        <div className="panel-corner top-left"></div>
        <div className="panel-corner top-right"></div>
        <div className="panel-corner bottom-left"></div>
        <div className="panel-corner bottom-right"></div>
      </div>
      
      <div className="panel-header">
        <div className="panel-title">{title}</div>
        <div className="panel-indicator"></div>
      </div>
      
      <div className="panel-content">
        {children}
      </div>
      
      <div className="panel-glow"></div>
    </div>
  );
}
