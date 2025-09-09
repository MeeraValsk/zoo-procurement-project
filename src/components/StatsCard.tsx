import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  variant?: "primary" | "accent" | "success" | "warning";
  subtitle?: string;
}

const variants = {
  primary: "bg-gradient-primary text-primary-foreground",
  accent: "bg-gradient-accent text-accent-foreground", 
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground"
};

export function StatsCard({ title, value, icon, variant = "primary", subtitle }: StatsCardProps) {
  return (
    <Card className={`p-6 shadow-medium ${variants[variant]}`}>
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/20 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}