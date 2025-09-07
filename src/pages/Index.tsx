import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StaffDashboard from "@/components/StaffDashboard";
import SupplierDashboard from "@/components/SupplierDashboard";
import InvoiceDashboard from "@/components/InvoiceDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import LoginForm from "@/components/LoginForm";

const Index = () => {
  const { user, profile, loading } = useAuthContext();
  const [currentRole, setCurrentRole] = useState<"staff" | "supplier" | "invoice" | "admin">("staff");

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user || !profile) {
    return <LoginForm />;
  }

  // Use user's actual role from profile
  const userRole = profile.role;

  const renderDashboard = () => {
    switch (userRole) {
      case "staff":
        return <StaffDashboard />;
      case "supplier":
        return <SupplierDashboard />;
      case "invoice_team":
        return <InvoiceDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <StaffDashboard />;
    }
  };

  return (
    <DashboardLayout 
      currentRole={userRole === "invoice_team" ? "invoice" : userRole} 
      onRoleChange={setCurrentRole}
    >
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Index;
