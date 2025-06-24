import { useEffect, useState } from "react";
import { Heart, Share, Bookmark } from "lucide-react";

interface SwipeFeedbackProps {
  action: "like" | "share" | "bookmark" | null;
  onComplete: () => void;
}

export default function SwipeFeedback({ action, onComplete }: SwipeFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (action) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [action, onComplete]);

  if (!action) return null;

  const getActionConfig = () => {
    switch (action) {
      case "like":
        return {
          icon: <Heart className="w-8 h-8 fill-current" />,
          text: "Liked!",
          color: "text-red-500",
          bg: "bg-red-50"
        };
      case "share":
        return {
          icon: <Share className="w-8 h-8" />,
          text: "Shared!",
          color: "text-blue-500",
          bg: "bg-blue-50"
        };
      case "bookmark":
        return {
          icon: <Bookmark className="w-8 h-8" />,
          text: "Saved!",
          color: "text-green-500",
          bg: "bg-green-50"
        };
      default:
        return null;
    }
  };

  const config = getActionConfig();
  if (!config) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`${config.bg} ${config.color} px-6 py-4 rounded-full border-2 border-current transform transition-all duration-300 ${
          isVisible ? "scale-100" : "scale-50"
        }`}
      >
        <div className="flex items-center space-x-3">
          {config.icon}
          <span className="text-lg font-semibold">{config.text}</span>
        </div>
      </div>
    </div>
  );
}