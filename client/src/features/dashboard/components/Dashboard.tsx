/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from "react";
import { motion } from "framer-motion";
import { StatsGrid } from "./dashboard/StatsGrid";
import { QuickActions } from "./dashboard/QuickActions";
import { RecentPosts } from "./dashboard/RecentPosts";
import { PerformanceChart } from "./dashboard/PerformanceChart";
import { PopularTemplates } from "./dashboard/PopularTemplates";
import { UpcomingSchedule } from "./dashboard/UpcomingSchedule";
import { useScrollAnimation } from "@/shared/hooks/use-scroll-animation";
import { Button } from "@/shared/components/ui/button";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  const { ref: statsRef, isInView: statsInView } = useScrollAnimation({ threshold: 0.2 });
  const { ref: actionsRef, isInView: actionsInView } = useScrollAnimation({ threshold: 0.2 });
  const { ref: performanceRef, isInView: performanceInView } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div 
      className="space-y-6" 
      data-testid="dashboard-page"
      style={{
        containerType: 'inline-size', // Modern CSS container queries
      }}
    >
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>
        </div>
      </motion.div>

      {/* Stats Grid with Enhanced Animations */}
      <motion.div
        ref={statsRef}
        variants={sectionVariants}
        initial="hidden"
        animate={statsInView ? "visible" : "hidden"}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <StatsGrid />
      </motion.div>

      {/* Main Content Grid with Container Queries */}
      <motion.div
        ref={actionsRef}
        variants={sectionVariants}
        initial="hidden"
        animate={actionsInView ? "visible" : "hidden"}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          containerType: 'inline-size',
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          <QuickActions />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          <RecentPosts />
        </motion.div>
      </motion.div>

      {/* Performance Section with Advanced Hover Effects */}
      <motion.div
        ref={performanceRef}
        variants={sectionVariants}
        initial="hidden"
        animate={performanceInView ? "visible" : "hidden"}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <motion.div
          whileHover={{ 
            scale: 1.01, 
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            filter: "brightness(1.05)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="rounded-lg overflow-hidden"
        >
          <PerformanceChart />
        </motion.div>
        <motion.div
          whileHover={{ 
            scale: 1.01, 
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            filter: "brightness(1.05)"
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="rounded-lg overflow-hidden"
        >
          <PopularTemplates />
        </motion.div>
      </motion.div>

      {/* Upcoming Schedule with Full Width and Enhanced Animation */}
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        whileHover={{ y: -2 }}
        className="w-full"
      >
        <UpcomingSchedule />
      </motion.div>

      {/* Modern CSS Features Demo Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-12 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
        style={{
          backdropFilter: 'blur(10px)',
          containerType: 'inline-size',
        }}
      >
        <h3 className="text-xl font-semibold mb-4 text-center">
          🚀 Enhanced Features Showcase
        </h3>
        <div 
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          <div className="text-center p-4 rounded-lg bg-background/50">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-medium">Advanced Animations</div>
            <div className="text-sm text-muted-foreground">Framer Motion with physics</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background/50">
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-medium">Modern CSS</div>
            <div className="text-sm text-muted-foreground">Container queries & subgrid</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background/50">
            <div className="text-2xl mb-2">🔒</div>
            <div className="font-medium">Type Safety</div>
            <div className="text-sm text-muted-foreground">Enhanced TypeScript patterns</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background/50">
            <div className="text-2xl mb-2">♿</div>
            <div className="font-medium">Accessibility</div>
            <div className="text-sm text-muted-foreground">ARIA & keyboard navigation</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
