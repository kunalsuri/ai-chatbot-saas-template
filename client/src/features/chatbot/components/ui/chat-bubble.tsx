/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  className?: string;
}

export function ChatBubble({ message, isUser, timestamp, className }: ChatBubbleProps) {
  return (
    <motion.div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-lg",
        "font-sans text-base leading-normal",
        "transition-all duration-200 ease-in-out",
        "shadow-sm",
        isUser 
          ? "bg-chat-message-user text-chat-text-primary rounded-br-sm ml-12" 
          : "bg-chat-message-assistant text-chat-text-primary rounded-bl-sm mr-12"
      )}>
        <div className="whitespace-pre-wrap break-words">
          {message}
        </div>
        {timestamp && (
          <div className={cn(
            "text-xs mt-2 opacity-70",
            "text-chat-text-secondary"
          )}>
            {timestamp}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ChatMessageListProps {
  messages: Array<{
    id: string;
    content: string;
    isUser: boolean;
    timestamp?: string;
  }>;
  className?: string;
}

export function ChatMessageList({ messages, className }: ChatMessageListProps) {
  return (
    <div className={cn(
      "flex flex-col space-y-2 p-4",
      "bg-chat-area min-h-full",
      className
    )}>
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message.content}
          isUser={message.isUser}
          timestamp={message.timestamp}
        />
      ))}
    </div>
  );
}
