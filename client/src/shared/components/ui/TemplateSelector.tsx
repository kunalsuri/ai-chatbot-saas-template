/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { ExampleTemplate } from '@shared/types/api';
import { useToast } from "@/shared/hooks/use-toast";
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

interface TemplateSelectorProps {
  category: 'chat' | 'translate' | 'prompt' | 'summary';
  onSelectTemplate: (text: string) => void;
  className?: string;
}

export function TemplateSelector({ category, onSelectTemplate, className = '' }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<ExampleTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const templateRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      setError(null);
      try {
        const fetchedTemplates = await api.getExampleTemplates(category);
        setTemplates(fetchedTemplates);
        // Initialize refs array with the correct length
        templateRefs.current = fetchedTemplates.map(() => null);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        setError('Failed to load templates');
        toast({
          title: 'Error',
          description: 'Failed to load example templates',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [category, toast]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
        if (index < templates.length - 1) {
          templateRefs.current[index + 1]?.focus();
        }
        break;
      case 'ArrowLeft':
        if (index > 0) {
          templateRefs.current[index - 1]?.focus();
        }
        break;
      default:
        break;
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTemplates = await api.getExampleTemplates(category);
      setTemplates(fetchedTemplates);
      templateRefs.current = fetchedTemplates.map(() => null);
      toast({
        title: 'Success',
        description: 'Templates loaded successfully',
      });
    } catch (err) {
      console.error('Failed to fetch templates on retry:', err);
      setError('Failed to load templates');
      toast({
        title: 'Error',
        description: 'Failed to load example templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-2 ${className}`} role="status" aria-live="polite">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span className="ml-2 text-sm text-muted-foreground">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={`${className}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load templates</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div 
      className={`flex flex-wrap gap-2 ${className}`}
      role="region"
      aria-label={`${category} templates`}
    >
      {templates.map((template, index) => (
        <Button
          key={template.id}
          variant="outline"
          size="sm"
          onClick={() => onSelectTemplate(template.text)}
          className="text-xs"
          aria-label={`Use template: ${template.label}`}
          ref={(el) => (templateRefs.current[index] = el)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          tabIndex={0}
        >
          {template.label}
        </Button>
      ))}
    </div>
  );
}