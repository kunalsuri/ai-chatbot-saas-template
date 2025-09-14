/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useLocation } from "wouter";
import { Sparkles, Image as ImageIcon, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";

const MotionButton = motion(Button);

export function QuickActions() {
  const [, navigate] = useLocation();

  const actions = [
    {
      title: "Generate AI Quote",
      description: "Create inspirational quotes",
      icon: Sparkles,
      bgColor: "bg-gradient-to-br from-brand-500 to-indigo-600",
      href: "/generate/quote",
    },
    {
      title: "Create Image",
      description: "Generate AI images",
      icon: ImageIcon,
      bgColor: "bg-gradient-to-br from-purple-500 to-pink-600",
      href: "/generate/image",
    },
    {
      title: "Schedule Post",
      description: "Plan your content calendar",
      icon: CalendarPlus,
      bgColor: "bg-gradient-to-br from-orange-500 to-red-500",
      onClick: () => navigate("/calendar"),
    },
  ];

  return (
    <Card className="p-6 border border-slate-200 shadow-sm" data-testid="quick-actions">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <MotionButton
            key={index}
            variant="outline"
            className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:border-brand-300 hover:bg-brand-50 group h-auto"
            onClick={action.onClick}
            data-testid={`action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
            whileHover={{ 
              y: -2,
              boxShadow: "0 4px 12px -4px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ 
              scale: 0.98,
              boxShadow: "0 2px 6px -2px rgba(0, 0, 0, 0.1)"
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 17
            }}
          >
            <motion.div 
              className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}
              whileHover={{ rotate: 5, scale: 1.05 }}
            >
              <action.icon className="w-5 h-5 text-white" />
            </motion.div>
            <div className="text-left flex-1">
              <p className="font-medium text-slate-800 group-hover:text-brand-700">
                {action.title}
              </p>
              <p className="text-sm text-slate-500">
                {action.description}
              </p>
            </div>
          </MotionButton>
        ))}
      </div>
    </Card>
  );
}
