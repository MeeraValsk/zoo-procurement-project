import { ReactNode, useState } from "react";
import { LayoutDashboard, ShoppingCart, Package, FileText, Users, Menu, X, User as UserIcon, LogOut, UserPlus, Wheat, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const roleNavigation = {
  staff: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Create Order", icon: ShoppingCart },
    { name: "My Orders", icon: Package },
  ],
  supplier: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Orders", icon: Package },
    { name: "Invoices", icon: FileText },
  ],
  invoice: [
    { name: "dashboard", icon: LayoutDashboard },
    { name: "pending", icon: Clock },
    { name: "verified", icon: CheckCircle },
    { name: "discrepancies", icon: AlertTriangle },
  ],
  admin: [
    { name: "dashboard", icon: LayoutDashboard },
    { name: "orders", icon: Package },
    { name: "invoices", icon: FileText },
    { name: "userManagement", icon: UserPlus },
    { name: "feedManagement", icon: Wheat },
  ],
};

export default function DashboardLayout({ children, user, currentView = "Dashboard", onViewChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigation = roleNavigation[user.role];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-full flex-col bg-cyan-800 border-r border-gray-200">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4">
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>Zoo Procurement</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-cyan-700"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4">
            <div className="bg-gradient-primary rounded-lg p-3 text-primary-foreground text-sm font-medium mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {sidebarOpen ? (
                <div>
                  <div className="text-xs opacity-90 mb-1" style={{ fontWeight: 400 }}>Welcome back</div>
                  <div className="font-semibold" style={{ fontWeight: 600 }}>{user.name}</div>
                  <div className="text-xs opacity-80" style={{ fontWeight: 400 }}>{user.zoo || user.company}</div>
                </div>
              ) : (
                <div className="text-center" style={{ fontWeight: 600 }}>
                  {user.role[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => onViewChange?.(item.name)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 mb-1 rounded-lg transition-colors",
                    isActive 
                      ? "bg-cyan-700 text-white" 
                      : "text-white hover:bg-cyan-700"
                  )}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500 }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3 text-sm">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/70 capitalize">{user.role}</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white hover:bg-cyan-700"
              >
                <LogOut className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <header className="h-16 bg-card border-b border-border">
          <div className="flex h-full items-center px-6">
            <h2 className="text-xl font-semibold text-foreground">
              {user.role === "staff" ? "Staff Dashboard" :
               user.role === "supplier" ? "Supplier Portal" :
               user.role === "invoice" ? "Invoice Team" : "Admin Dashboard"}
            </h2>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
