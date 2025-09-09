import { ReactNode, useState } from "react";
import { LayoutDashboard, ShoppingCart, Package, FileText, Users, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  currentRole: "staff" | "supplier" | "invoice" | "admin";
  onRoleChange: (role: "staff" | "supplier" | "invoice" | "admin") => void;
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
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Pending", icon: FileText },
    { name: "Verified", icon: FileText },
  ],
  admin: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Orders", icon: Package },
    { name: "Suppliers", icon: Users },
    { name: "Reports", icon: FileText },
  ],
};

export default function DashboardLayout({ children, currentRole, onRoleChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = roleNavigation[currentRole];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4">
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-sidebar-foreground">Zoo Procurement</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Role Switcher */}
          <div className="p-4">
            <div className="bg-gradient-primary rounded-lg p-3 text-primary-foreground text-sm font-medium mb-3">
              {sidebarOpen ? (
                <div>
                  <div className="text-xs opacity-90 mb-1">Current Role</div>
                  <div className="capitalize">{currentRole === "invoice" ? "Invoice Team" : currentRole}</div>
                </div>
              ) : (
                <div className="text-center">
                  {currentRole[0].toUpperCase()}
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <div className="space-y-1">
                {(["staff", "supplier", "invoice", "admin"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => onRoleChange(role)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      currentRole === role
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    {role === "invoice" ? "Invoice Team" : role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className="w-full flex items-center px-3 py-2 mb-1 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3 text-sm">{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-4 w-4 text-sidebar-accent-foreground" />
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-sidebar-foreground">Demo User</p>
                  <p className="text-xs text-sidebar-foreground/70">{currentRole}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <header className="h-16 bg-card border-b border-border">
          <div className="flex h-full items-center px-6">
            <h2 className="text-xl font-semibold text-foreground">
              {currentRole === "staff" ? "Staff Dashboard" :
               currentRole === "supplier" ? "Supplier Portal" :
               currentRole === "invoice" ? "Invoice Team" : "Admin Dashboard"}
            </h2>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}