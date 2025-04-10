import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TypingText } from "./typing-text";

interface RainbowButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  typingDelay?: number;
}

export function RainbowButton({
  children,
  className,
  href,
  onClick,
  typingDelay = 40,
}: RainbowButtonProps) {
  const buttonText = typeof children === 'string' ? children : 'Start Selling';
  
  const buttonContent = (
    <button
      onClick={onClick}
      aria-label={buttonText}
      className={cn(
        "relative inline-flex h-12 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "hover:shadow-[0_0_2rem_-0.5rem_#fff8] transition-all duration-300",
        "bg-gradient-to-r from-primary via-accent to-purple-500",
        "animate-gradient-xy",
        className
      )}
    >
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl px-8 py-2 bg-background/10 backdrop-blur-3xl">
        <span className="text-lg font-semibold text-white">
          {buttonText}
        </span>
      </span>
    </button>
  );

  if (href) {
    return <a href={href}>{buttonContent}</a>;
  }

  return buttonContent;
} 