import { useState, useEffect } from "react";

interface LiveIndicatorProps {
  className?: string;
}

export default function LiveIndicator({ className = "" }: LiveIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 1000); // Blink every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div 
        className={`w-2 h-2 bg-red-500 rounded-full transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-30'
        }`}
      />
      <span className="text-xs font-medium text-red-600">LIVE</span>
    </div>
  );
}