/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useLocation } from "wouter";

export function PopularTemplates() {
  const [, navigate] = useLocation();
  
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates/popular"],
    queryFn: () => api.getPopularTemplates(),
  });

  const handleSelectTemplate = (templateId: string) => {
    navigate(`/create-post?template=${templateId}`);
  };

  if (isLoading) {
    return (
      <Card className="p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-20 mx-auto mt-2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getTemplateIcon = (name: string) => {
    const iconMap: Record<string, string> = {
      "Minimal Quote": "fas fa-quote-left",
      "Gradient Style": "fas fa-palette",
      "Bold Typography": "fas fa-font",
      "Nature Theme": "fas fa-leaf",
    };
    return iconMap[name] || "fas fa-image";
  };

  const getTemplateGradient = (backgroundColor?: string) => {
    if (!backgroundColor) return "bg-gradient-to-br from-slate-100 to-slate-200";
    
    const colorMap: Record<string, string> = {
      "#f8fafc": "bg-gradient-to-br from-brand-100 to-indigo-100",
      "#8b5cf6": "bg-gradient-to-br from-brand-500 to-purple-600",
      "#1e293b": "bg-gradient-to-br from-slate-800 to-slate-900",
      "#059669": "bg-gradient-to-br from-green-500 to-emerald-600",
    };
    
    return colorMap[backgroundColor] || "bg-gradient-to-br from-slate-100 to-slate-200";
  };

  return (
    <Card className="p-6 border border-slate-200 shadow-sm" data-testid="popular-templates">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Popular Templates</h3>
        <Button
          variant="link"
          className="text-brand-600 text-sm font-medium hover:text-brand-700"
          onClick={() => navigate("/templates")}
          data-testid="button-browse-all-templates"
        >
          Browse all
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {!templates || templates.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <i className="fas fa-layer-group text-4xl text-slate-300 mb-4"></i>
            <p className="text-slate-500 font-medium">No templates available</p>
          </div>
        ) : (
          templates.slice(0, 4).map((template) => {
            const icon = getTemplateIcon(template.name);
            const gradient = getTemplateGradient(template.backgroundColor);
            
            return (
              <div key={template.id} className="group cursor-pointer" onClick={() => handleSelectTemplate(template.id)} data-testid={`template-${template.id}`}>
                <div className={`aspect-square ${gradient} rounded-lg border border-slate-200 group-hover:border-brand-300 transition-colors p-4 flex items-center justify-center`}>
                  <div className="text-center">
                    <i className={`${icon} text-2xl mb-2`} style={{ color: template.textColor || "#64748b" }}></i>
                    <p className="text-sm font-medium" style={{ color: template.textColor || "#334155" }}>
                      {template.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2 text-center" data-testid={`template-usage-${template.id}`}>
                  Used {template.usageCount || 0} times
                </p>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
