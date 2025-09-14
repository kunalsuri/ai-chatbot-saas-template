/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, Clock, Heart, Layers } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { motion } from "framer-motion";

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16 mb-4" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-sm text-slate-500">Unable to load stats</p>
        </Card>
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Posts",
      value: stats.totalPosts.toString(),
      icon: ImageIcon,
      bgColor: "bg-brand-100",
      iconColor: "text-brand-600",
      change: "+12%",
      changeLabel: "from last month",
    },
    {
      label: "Scheduled",
      value: stats.scheduled.toString(),
      icon: Clock,
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      change: "+8%",
      changeLabel: "from last week",
    },
    {
      label: "Engagement",
      value: stats.engagement,
      icon: Heart,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      change: "+15%",
      changeLabel: "from last month",
    },
    {
      label: "Templates",
      value: stats.templates.toString(),
      icon: Layers,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
      change: "+4",
      changeLabel: "new this week",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariant = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {statItems.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariant}
          className="h-full"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Card className="p-6 border border-border bg-card text-card-foreground shadow-lg h-full" data-testid={`stat-${item.label.toLowerCase().replace(' ', '-')}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1" data-testid={`stat-value-${index}`}>
                  {item.value}
                </p>
              </div>
              <motion.div 
                className={`w-12 h-12 ${item.bgColor} dark:${item.bgColor.replace('100', '900/20')} rounded-xl flex items-center justify-center`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <item.icon className={`w-5 h-5 ${item.iconColor} dark:${item.iconColor.replace('600', '400')}`} />
              </motion.div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{item.change}</span>
              <span className="text-muted-foreground ml-2">{item.changeLabel}</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
