/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import React from "react";
import { motion } from "framer-motion";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentPosts } from "@/components/dashboard/RecentPosts";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PopularTemplates } from "@/components/dashboard/PopularTemplates";
import { UpcomingSchedule } from "@/components/dashboard/UpcomingSchedule";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// Enhanced dashboard with modern CSS features and animations
const sectionVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }
};

function AnimatedSection({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      style={{
        containerType: 'inline-size', // Modern CSS container queries
      }}
    >
      {children}
    </motion.div>
  );
}

export default function EnhancedDashboard() {
  return (
    <div 
      className="dashboard-grid space-y-6"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '1.5rem',
        containerType: 'inline-size',
      }}
      data-testid="enhanced-dashboard-page"
    >
      {/* Stats Grid with enhanced animations */}
      <AnimatedSection className="dashboard-section" delay={0}>
        <StatsGrid />
      </AnimatedSection>

      {/* Main Content Grid with container queries */}
      <AnimatedSection 
        className="dashboard-section"
        delay={0.1}
      >
        <div 
          className="content-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            gridColumn: '1 / -1',
          }}
        >
          {/* Quick Actions */}
          <motion.div
            className="card-container"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <QuickActions />
          </motion.div>

          {/* Recent Posts */}
          <motion.div
            className="card-container"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <RecentPosts />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Performance Section with subgrid */}
      <AnimatedSection 
        className="dashboard-section"
        delay={0.2}
      >
        <div 
          className="performance-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            gridColumn: '1 / -1',
          }}
        >
          {/* Performance Analytics */}
          <motion.div
            className="card-container"
            whileHover={{ 
              scale: 1.01, 
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)" 
            }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <PerformanceChart />
          </motion.div>

          {/* Popular Templates */}
          <motion.div
            className="card-container"
            whileHover={{ 
              scale: 1.01, 
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)" 
            }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <PopularTemplates />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Upcoming Schedule with full width */}
      <AnimatedSection 
        className="dashboard-section"
        delay={0.3}
      >
        <motion.div
          className="card-container"
          style={{ gridColumn: '1 / -1' }}
          whileHover={{ y: -1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <UpcomingSchedule />
        </motion.div>
      </AnimatedSection>
    </div>
  );
}
