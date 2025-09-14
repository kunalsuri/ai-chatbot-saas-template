/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect } from 'react';
import { HistoryList } from '@/shared/components/ui/HistoryList';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useToast } from '@/shared/hooks/use-toast';
import { secureGet, secureDelete } from '@/features/auth/utils/secureApi';
import { AuthenticationError, ServerRestartError } from '@/features/auth/utils/secureApi';
import { formatDistanceToNow } from 'date-fns';
import { ChatSession } from '../types';

interface ChatHistoryProps {
  onSelect?: (session: ChatSession) => void;
  selectedId?: string | null;
  onClose?: () => void;
  className?: string;
}

export function ChatHistory({
  onSelect,
  selectedId,
  onClose,
  className = ""
}: ChatHistoryProps) {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await secureGet('/api/chat/history');
      
      // Transform the data to ensure dates are Date objects
      const historyData = response.data?.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })) || [];
      
      setChatHistory(historyData);
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        toast({
          title: "Session Expired",
          description: "Please log in to access chat history",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await secureDelete(`/api/chat/history/${id}`);
      setChatHistory(chatHistory.filter(session => session.id !== id));
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ServerRestartError) {
        toast({
          title: "Session Expired",
          description: "Please log in to delete chat session",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete chat session",
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  const renderChatSession = (session: ChatSession) => {
    // Get the last message for preview
    const lastMessage = session.messages[session.messages.length - 1];
    const lastUserMessage = session.messages.filter(msg => msg.role === 'user').pop();
    
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0 space-y-2">
          <div className="flex justify-between items-start">
            <div className="font-medium">{session.title}</div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
            </span>
          </div>
          
          {lastUserMessage && (
            <div className="text-sm line-clamp-1 text-muted-foreground">
              <span className="font-medium">You: </span>
              {lastUserMessage.content}
            </div>
          )}
          
          {lastMessage && lastMessage.role === 'assistant' && (
            <div className="text-sm line-clamp-2 text-muted-foreground">
              <span className="font-medium">AI: </span>
              {lastMessage.content}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {session.messages.length} messages
            {lastMessage?.metadata?.model && ` • ${lastMessage.metadata.model}`}
            {lastMessage?.metadata?.provider && ` • ${lastMessage.metadata.provider}`}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <HistoryList
      title="Chat History"
      items={chatHistory}
      renderItem={renderChatSession}
      onItemSelect={onSelect}
      onItemDelete={handleDelete}
      selectedItemId={selectedId}
      emptyMessage="No chat history found"
      isLoading={isLoading}
      onClose={onClose}
      className={className}
    />
  );
}
