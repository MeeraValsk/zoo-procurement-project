import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: ReactNode;
  color?: string;
  delay?: number;
  variant?: "primary" | "accent" | "success" | "warning";
  subtitle?: string;
}

const variants = {
  primary: "bg-gradient-primary text-primary-foreground",
  accent: "bg-gradient-accent text-accent-foreground", 
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground"
};

export function StatsCard({ title, value, change, icon, color, delay = 0, variant = "primary", subtitle }: StatsCardProps) {
  return (
    <Card 
      className={`p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fadeIn`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-2xl ${color || 'bg-gradient-to-br from-emerald-500 to-blue-600'}`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {change && (
            <p className="text-xs font-medium text-emerald-600 mt-1">
              {change}
            </p>
          )}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}