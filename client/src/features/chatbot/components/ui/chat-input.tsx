/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({ 
  onSend, 
  placeholder = "Type your message...", 
  disabled = false,
  className 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative flex items-end bg-input rounded-2xl border border-border focus-within:border-ring transition-colors duration-200 shadow-sm">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent px-4 py-3 pr-12",
            "text-foreground placeholder:text-muted-foreground",
            "border-0 outline-none focus:ring-0",
            "min-h-[48px] max-h-32 overflow-y-auto",
            "font-sans text-base leading-normal"
          )}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--muted-foreground) transparent'
          }}
        />
        
        <motion.button
          type="submit"
          className="absolute right-2 bottom-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 w-10 h-10 flex-shrink-0 flex items-center justify-center disabled:opacity-50"
          disabled={!message.trim() || disabled}
          aria-label="Send message"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </form>
  );
}
