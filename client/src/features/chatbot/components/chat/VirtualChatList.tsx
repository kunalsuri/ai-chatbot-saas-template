/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useMemo } from 'react';
import { VirtualList } from '@/shared/components/ui/virtual-list';
import { ChatBubble } from '../ui/chat-bubble';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
}

interface VirtualChatListProps {
  messages: Message[];
  containerHeight: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualChatList({
  messages,
  containerHeight,
  className = '',
  onScroll
}: VirtualChatListProps) {
  const itemHeight = 120; // Approximate height per message

  const renderMessage = useMemo(() => 
    (message: Message, index: number) => (
      <div className="px-4 py-2">
        <ChatBubble
          message={message.content}
          isUser={message.role === 'user'}
          timestamp={message.timestamp}
        />
      </div>
    ), []
  );

  return (
    <VirtualList
      items={messages}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderMessage}
      className={className}
      onScroll={onScroll}
      overscan={3}
    />
  );
}
