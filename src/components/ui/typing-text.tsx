import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TypingText({ text, className, delay = 50 }: TypingTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [text, currentIndex, delay]);

  return (
    <div className={cn("relative", className)}>
      {displayText}
      <span className="animate-pulse">|</span>
    </div>
  );
} 