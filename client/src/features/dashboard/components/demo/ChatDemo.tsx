/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState } from 'react';
import { ChatInput } from '@/features/chatbot/components/ui/chat-input';
import { ChatBubble } from '@/features/chatbot/components/ui/chat-bubble';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/components/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

function ChatDemo() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! This is a demo of our ChatGPT-style interface. Try typing a message below.',
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${content}". This is a demo response showcasing the ${actualTheme} theme styling!`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme as keyof typeof themeIcons];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with theme toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ChatGPT-Style Interface Demo</h1>
          <p className="text-muted-foreground">Experience the new theme system with full dark/light mode support</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
            className="transition-all duration-200 hover:scale-105"
          >
            <ThemeIcon className="h-4 w-4 mr-2" />
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </Button>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="bg-chat-area border-border overflow-hidden">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-chat-area">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t border-border p-4 bg-background">
          <ChatInput
            onSend={handleSendMessage}
            placeholder="Type your message here..."
          />
        </div>
      </Card>

      {/* Theme Information */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Theme System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-foreground mb-2">Current Theme</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Active: <span className="font-medium capitalize text-primary">{actualTheme}</span> mode
              {theme === 'system' && ' (following system preference)'}
            </p>
            
            <h4 className="font-medium text-foreground mb-2">Color Specifications</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Main background: {actualTheme === 'dark' ? '#1e1e1e' : '#FFFFFF'}</li>
              <li>• Chat area: {actualTheme === 'dark' ? '#252526' : '#F9F9FB'}</li>
              <li>• Sidebar: {actualTheme === 'dark' ? '#121212 (darker)' : '#EAEAEA'}</li>
              <li>• Text: {actualTheme === 'dark' ? '#ECECF1' : '#202123'}</li>
              <li>• Accent: #10A37F (consistent across themes)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-2">Accessibility Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• WCAG AA compliant contrast ratios</li>
              <li>• Keyboard navigation support</li>
              <li>• Focus indicators for all interactive elements</li>
              <li>• Reduced motion support</li>
              <li>• High contrast mode compatibility</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ChatDemo;
