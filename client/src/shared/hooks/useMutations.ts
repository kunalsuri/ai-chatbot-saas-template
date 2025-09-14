/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from "@/shared/hooks/use-toast";
import type { Quote, Post, Template } from '@/types';

export function useQuoteMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateQuote = useMutation({
    mutationFn: (params: {
      category?: string;
      theme?: string;
      tone?: string;
      keywords?: string[];
    }) => api.generateQuote(params),
    onSuccess: (data) => {
      toast({
        title: "Quote Generated",
        description: "Your quote has been generated successfully.",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate quote",
        variant: "destructive",
      });
    },
  });

  const generateQuoteOllama = useMutation({
    mutationFn: (params: {
      category?: string;
      theme?: string;
      tone?: string;
      keywords?: string[];
    }) => api.generateQuoteOllama(params),
    onSuccess: (data) => {
      toast({
        title: "Quote Generated",
        description: "Your quote has been generated with Ollama.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate quote with Ollama",
        variant: "destructive",
      });
    },
  });

  const generateCustomQuoteOllama = useMutation({
    mutationFn: ({ prompt, model }: { prompt: string; model?: string }) => 
      api.generateCustomQuoteOllama(prompt, model),
    onSuccess: () => {
      toast({
        title: "Custom Quote Generated",
        description: "Your custom quote has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate custom quote",
        variant: "destructive",
      });
    },
  });

  return {
    generateQuote,
    generateQuoteOllama,
    generateCustomQuoteOllama,
  };
}

export function usePostMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: (postData: Partial<Post>) => api.createPost(postData),
    onSuccess: (data) => {
      toast({
        title: "Post Created",
        description: "Your post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const schedulePost = useMutation({
    mutationFn: ({ postId, scheduledFor }: { postId: string; scheduledFor: Date }) =>
      api.schedulePost(postId, scheduledFor),
    onSuccess: () => {
      toast({
        title: "Post Scheduled",
        description: "Your post has been scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: error.message || "Failed to schedule post",
        variant: "destructive",
      });
    },
  });

  const publishPost = useMutation({
    mutationFn: ({ postId, platform }: { postId: string; platform?: string }) =>
      api.publishPost(postId, platform),
    onSuccess: () => {
      toast({
        title: "Post Published",
        description: "Your post has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish post",
        variant: "destructive",
      });
    },
  });

  return {
    createPost,
    schedulePost,
    publishPost,
  };
}

export function useCaptionMutations() {
  const { toast } = useToast();

  const generateCaption = useMutation({
    mutationFn: (params: {
      quoteText: string;
      platform?: string;
      includeHashtags?: boolean;
      includeEmojis?: boolean;
      tone?: string;
    }) => api.generateCaption(params),
    onSuccess: () => {
      toast({
        title: "Caption Generated",
        description: "Your caption has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate caption",
        variant: "destructive",
      });
    },
  });

  return {
    generateCaption,
  };
}

export function useOllamaMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testConnection = useMutation({
    mutationFn: (model: string) => api.testOllamaConnection(model),
    onSuccess: (data) => {
      if (data.connected) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Ollama.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/ollama/health"] });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Ollama",
        variant: "destructive",
      });
    },
  });

  return {
    testConnection,
  };
}

export function useImageMutations() {
  const { toast } = useToast();

  const searchImages = useMutation({
    mutationFn: (params: {
      q: string;
      page?: number;
      per_page?: number;
      orientation?: "landscape" | "portrait" | "square";
      category?: string;
    }) => api.searchImages(params),
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search images",
        variant: "destructive",
      });
    },
  });

  const searchPixabayImages = useMutation({
    mutationFn: (params: {
      q: string;
      page?: number;
      per_page?: number;
      orientation?: "all" | "horizontal" | "vertical";
      category?: string;
      colors?: string;
      order?: "popular" | "latest";
    }) => api.searchPixabayImages(params),
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search Pixabay images",
        variant: "destructive",
      });
    },
  });

  return {
    searchImages,
    searchPixabayImages,
  };
}
