/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Animal avatar categories and their corresponding images (only available ones)
const animalAvatars = {
  available: [
    { id: 'cat', name: 'Cat', src: '/assets/avatars/cat.svg' },
    { id: 'fox', name: 'Fox', src: '/assets/avatars/fox.svg' },
    { id: 'owl', name: 'Owl', src: '/assets/avatars/owl.svg' },
    { id: 'default', name: 'Default', src: '/assets/avatars/default.svg' }
  ]
};

interface AnimalAvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (avatarUrl: string) => void;
  currentAvatar?: string;
}

export function AnimalAvatarSelector({ open, onOpenChange, onSelect, currentAvatar }: AnimalAvatarSelectorProps) {
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);
  
  // Set initial preview to current avatar if available
  useEffect(() => {
    if (currentAvatar) {
      setPreviewAvatar(currentAvatar);
    }
  }, [currentAvatar]);
  
  const handleSelect = (avatarUrl: string) => {
    onSelect(avatarUrl);
    onOpenChange(false);
  };
  
  const handleAvatarHover = (avatarUrl: string) => {
    setHoveredAvatar(avatarUrl);
    setPreviewAvatar(avatarUrl);
  };
  
  const handleAvatarLeave = () => {
    setHoveredAvatar(null);
    setPreviewAvatar(currentAvatar || null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-black/90 text-white border-neutral-800">
        <div className="flex flex-col md:flex-row h-[500px]">
          {/* Preview Panel */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-neutral-900 to-black">
            <motion.div 
              className="relative w-48 h-48 mb-6 rounded-full overflow-hidden border-4 border-primary/80 shadow-xl shadow-primary/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {previewAvatar ? (
                <motion.img 
                  key={previewAvatar}
                  src={previewAvatar} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-contain"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/avatars/default.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                  <span className="text-neutral-400">Select an avatar</span>
                </div>
              )}
            </motion.div>
            
            <DialogTitle className="text-xl text-center mb-2">Choose Your Avatar</DialogTitle>
            <DialogDescription className="text-neutral-400 text-center mb-4">
              Select a fun animal avatar to represent you
            </DialogDescription>
            
            {previewAvatar && (
              <Button 
                onClick={() => handleSelect(previewAvatar)}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-full"
              >
                Confirm Selection
              </Button>
            )}
          </div>
          
          {/* Selection Panel */}
          <div className="w-full md:w-1/2 bg-neutral-900 p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Available Avatars</h3>
              <p className="text-sm text-neutral-400">Choose from our collection of animal avatars</p>
            </div>
            
            <ScrollArea className="h-[350px]">
              <div className="grid grid-cols-2 gap-3">
                {animalAvatars.available.map((animal) => (
                  <motion.div
                    key={animal.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      className={cn(
                        "cursor-pointer transition-all duration-200 overflow-hidden bg-neutral-800 border-neutral-700",
                        "hover:border-primary hover:shadow-md hover:shadow-primary/20",
                        (currentAvatar === animal.src || hoveredAvatar === animal.src) && "border-2 border-primary ring-2 ring-primary/30"
                      )}
                      onClick={() => handleSelect(animal.src)}
                      onMouseEnter={() => handleAvatarHover(animal.src)}
                      onMouseLeave={handleAvatarLeave}
                    >
                      <CardContent className="p-4 flex flex-col items-center relative">
                        {(currentAvatar === animal.src) && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="w-20 h-20 mb-3 rounded-full overflow-hidden bg-neutral-700 p-2">
                          <img 
                            src={animal.src} 
                            alt={animal.name} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback for missing images
                              (e.target as HTMLImageElement).src = '/assets/avatars/default.svg';
                            }}
                          />
                        </div>
                        <span className="text-sm text-center text-neutral-200 font-medium">{animal.name}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
