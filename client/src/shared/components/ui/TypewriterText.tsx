/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
  cursorClassName?: string;
  loop?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = '',
  cursorClassName = '',
  loop = true,
  onComplete,
}: TypewriterTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const typeText = useCallback(() => {
    const fullText = texts[currentTextIndex];
    if (!fullText) return;
    
    if (!isDeleting) {
      // Typing
      if (currentText.length < fullText.length) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      } else {
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      // Deleting
      if (currentText.length > 0) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      } else {
        // Finished deleting, move to next text
        setIsDeleting(false);
        const nextIndex = (currentTextIndex + 1) % texts.length;
        
        if (!loop && nextIndex === 0) {
          onComplete?.();
          return;
        }
        
        setCurrentTextIndex(nextIndex);
      }
    }
  }, [currentText, currentTextIndex, isDeleting, texts, pauseTime, loop, onComplete]);

  useEffect(() => {
    if (isPaused || texts.length === 0) return;

    const timeout = setTimeout(
      typeText,
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timeout);
  }, [typeText, isDeleting, speed, deleteSpeed, isPaused, texts.length]);

  return (
    <span className={cn('inline-block', className)}>
      {currentText}
      <span 
        className={cn(
          'inline-block w-0.5 h-[1em] bg-current ml-1 animate-pulse',
          cursorClassName
        )}
        aria-hidden="true"
      />
    </span>
  );
};

export default TypewriterText;
