import { useRef, useEffect } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance for a swipe
}

export function useSwipe(config: SwipeConfig) {
  const elementRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const threshold = config.threshold || 50;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Determine if this is a horizontal or vertical swipe
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);

      if (isHorizontalSwipe && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          config.onSwipeRight?.();
        } else {
          config.onSwipeLeft?.();
        }
      } else if (isVerticalSwipe && Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          config.onSwipeDown?.();
        } else {
          config.onSwipeUp?.();
        }
      }

      touchStartRef.current = null;
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [config, threshold]);

  return elementRef;
}