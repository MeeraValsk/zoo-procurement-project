import { ReactNode, useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  Settings,
  Menu,
  X,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  currentRole: "staff" | "supplier" | "invoice" | "admin";
  onRoleChange: (role: "staff" | "supplier" | "invoice" | "admin") => void;
}

const roleNavigation = {
  staff: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Create Order", icon: ShoppingCart, path: "/create-order" },
    { name: "My Orders", icon: Package, path: "/my-orders" },
  ],
  supplier: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Received Orders", icon: Package, path: "/received-orders" },
    { name: "Invoices", icon: FileText, path: "/invoices" },
  ],
  invoice: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Pending Invoices", icon: FileText, path: "/pending-invoices" },
    { name: "Verified Invoices", icon: FileText, path: "/verified-invoices" },
  ],
  admin: [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "All Orders", icon: Package, path: "/all-orders" },
    { name: "Suppliers", icon: Users, path: "/suppliers" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ],
};

const roleColors = {
  staff: "bg-gradient-primary",
  supplier: "bg-gradient-accent", 
  invoice: "bg-primary-light",
  admin: "bg-primary-dark"
};

export default function DashboardLayout({ children, currentRole, onRoleChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = roleNavigation[currentRole];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-smooth",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border shadow-medium">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-sidebar-foreground">
                Zoo Procurement
              </h1>
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
          <div className="p-4 border-b border-sidebar-border">
            <div className={cn(
              "rounded-lg p-3 text-white text-sm font-medium",
              roleColors[currentRole]
            )}>
              {sidebarOpen && (
                <div>
                  <div className="text-xs opacity-90 mb-1">Current Role</div>
                  <div className="capitalize">{currentRole === "invoice" ? "Invoice Team" : currentRole}</div>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <div className="mt-3 space-y-1">
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
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.path}
                  className="flex items-center px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                  )}
                </a>
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
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {currentRole === "staff" ? "John Doe" : 
                     currentRole === "supplier" ? "Green Feed Co." :
                     currentRole === "invoice" ? "Jane Smith" : "Admin User"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">
                    {currentRole === "invoice" ? "Invoice Team" : currentRole}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-smooth",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border shadow-soft">
          <div className="flex h-full items-center justify-between px-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {currentRole === "staff" ? "Staff Dashboard" :
                 currentRole === "supplier" ? "Supplier Portal" :
                 currentRole === "invoice" ? "Invoice Verification" : "Admin Dashboard"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentRole === "staff" ? "Manage your animal feed orders" :
                 currentRole === "supplier" ? "View and fulfill orders" :
                 currentRole === "invoice" ? "Verify and process invoices" : "Oversee all operations"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Notifications
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}