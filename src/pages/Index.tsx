import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StaffDashboard from "@/components/StaffDashboard";
import SupplierDashboard from "@/components/SupplierDashboard";
import InvoiceDashboard from "@/components/InvoiceDashboard";
import AdminDashboard from "@/components/AdminDashboard";

const Index = () => {
  const [currentRole, setCurrentRole] = useState<"staff" | "supplier" | "invoice" | "admin">("staff");

  const renderDashboard = () => {
    switch (currentRole) {
      case "staff":
        return <StaffDashboard />;
      case "supplier":
        return <SupplierDashboard />;
      case "invoice":
        return <InvoiceDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <StaffDashboard />;
    }
  };

  return (
    <DashboardLayout currentRole={currentRole} onRoleChange={setCurrentRole}>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Index;
