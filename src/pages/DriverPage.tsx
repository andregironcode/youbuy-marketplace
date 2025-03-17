
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { DriverRoutes } from "@/components/delivery/DriverRoutes";

const DriverPage = () => {
  const { user, loading, userData } = useAuth();
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading driver panel...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect if not a driver
  if (userData?.role !== 'driver') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary py-4 px-6 text-white">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">YouBuy Driver Panel</h1>
        </div>
      </header>
      
      <main className="flex-1 bg-background">
        <DriverRoutes />
      </main>
    </div>
  );
};

export default DriverPage;
