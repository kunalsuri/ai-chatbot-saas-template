/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ComponentId } from "@/shared/types/advanced-types";

interface ContainerQueryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  componentId: ComponentId;
  variant?: 'adaptive' | 'responsive' | 'fluid';
  children: React.ReactNode;
}

const ContainerQueryCard = React.forwardRef<HTMLDivElement, ContainerQueryCardProps>(
  ({ className, componentId, variant = 'adaptive', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base styles
          "card-container rounded-lg border bg-card text-card-foreground shadow-sm",
          // Container query styles will be applied via CSS
          variant === 'adaptive' && "adaptive-card",
          variant === 'responsive' && "responsive-card", 
          variant === 'fluid' && "fluid-card",
          className
        )}
        style={{
          containerType: 'inline-size',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        data-component-id={componentId}
        {...props}
      >
        <div className="card-content">
          {children}
        </div>
      </motion.div>
    );
  }
);

ContainerQueryCard.displayName = "ContainerQueryCard";

// Subgrid-enabled dashboard layout
interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div 
      className={cn("dashboard-grid", className)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '1rem',
        containerType: 'inline-size',
      }}
    >
      {children}
    </div>
  );
}

// Stats section with subgrid
interface StatsGridProps {
  stats: Array<{
    id: string;
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  className?: string;
}

function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div 
      className={cn("stats-grid", className)}
      style={{
        gridColumn: '1 / -1',
        display: 'grid',
        gridTemplateColumns: 'subgrid',
        gap: 'inherit',
      }}
    >
      {stats.map((stat, index) => (
        <ContainerQueryCard
          key={stat.id}
          componentId={`stat-${stat.id}` as ComponentId}
          className="stats-card"
          style={{
            gridColumn: `span ${Math.max(1, Math.floor(12 / stats.length))}`,
          }}
        >
          <div className="stats-content">
            {stat.icon && (
              <div className="icon">
                {stat.icon}
              </div>
            )}
            <div className="content">
              <div className="value">{stat.value}</div>
              <div className="label">{stat.label}</div>
              {stat.trend && (
                <div className={`trend trend-${stat.trend}`}>
                  {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
                </div>
              )}
            </div>
          </div>
        </ContainerQueryCard>
      ))}
    </div>
  );
}

// Form with container queries
interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
}

function ResponsiveForm({ children, className }: ResponsiveFormProps) {
  return (
    <div 
      className={cn("form-container", className)}
      style={{ containerType: 'inline-size' }}
    >
      <div className="form-grid">
        {children}
      </div>
    </div>
  );
}

// Navigation with container queries
interface ResponsiveNavProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    active?: boolean;
  }>;
  className?: string;
}

function ResponsiveNav({ items, className }: ResponsiveNavProps) {
  return (
    <nav 
      className={cn("navigation-container", className)}
      style={{ containerType: 'inline-size' }}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={cn(
            "nav-item",
            item.active && "nav-item-active"
          )}
        >
          <div className="nav-icon">{item.icon}</div>
          <span className="nav-label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export { 
  ContainerQueryCard, 
  DashboardGrid, 
  StatsGrid, 
  ResponsiveForm, 
  ResponsiveNav 
};
