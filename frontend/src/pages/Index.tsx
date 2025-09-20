import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StaffDashboard from "@/components/StaffDashboard";
import SupplierDashboard from "@/components/SupplierDashboard";
import InvoiceDashboard from "@/components/InvoiceDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

const Index = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState("Dashboard");

  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Zoo Procure Hub</h1>
            <p className="text-gray-600 mb-6">Please log in to access the dashboard</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    
    switch (user.role) {
      case "staff":
        return <StaffDashboard currentView={currentView} onViewChange={setCurrentView} />;
                 case "supplier":
                   return <SupplierDashboard currentView={currentView} onViewChange={setCurrentView} />;
      case "invoice":
        return <InvoiceDashboard currentView={currentView} onViewChange={setCurrentView} />;
      case "admin":
        return <AdminDashboard currentView={currentView} onViewChange={setCurrentView} />;
      default:
        return <StaffDashboard currentView={currentView} onViewChange={setCurrentView} />;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout 
        user={user!} 
        currentView={currentView} 
        onViewChange={setCurrentView}
      >
        {renderDashboard()}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Index;
