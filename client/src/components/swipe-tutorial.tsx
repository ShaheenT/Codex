import { useState, useEffect } from "react";
import { Heart, Share, Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SwipeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SwipeTutorial({ isOpen, onClose }: SwipeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Swipe Right to Like",
      description: "Quickly like specials by swiping right on any deal",
      gesture: "👉",
    },
    {
      icon: <Share className="w-8 h-8 text-blue-500" />,
      title: "Swipe Left to Share",
      description: "Share deals with followers by swiping left",
      gesture: "👈",
    },
    {
      icon: <Bookmark className="w-8 h-8 text-purple-500" />,
      title: "Swipe Up to Save",
      description: "Bookmark specials for later by swiping up",
      gesture: "👆",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            Mobile Gestures
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-6xl">{steps[currentStep].gesture}</div>
            <div className="flex justify-center">{steps[currentStep].icon}</div>
            <div>
              <h3 className="font-semibold text-lg">{steps[currentStep].title}</h3>
              <p className="text-gray-600 text-sm mt-2">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-pink-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={skipTutorial} className="flex-1">
              Skip
            </Button>
            <Button onClick={nextStep} className="flex-1 bg-pink-600 hover:bg-pink-700">
              {currentStep === steps.length - 1 ? "Got it!" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}