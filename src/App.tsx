import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect, useState } from "react";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import { cn } from "./lib/utils";
import { Header } from "./components/Header";
import { MobileSidebar } from "./components/MobileSidebar";
import Sidebar from "./components/Sidebar";
import { BREAKPOINTS } from "./lib/types";

function App() {
  const { isAuthenticated, loading, checkAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        if (isMounted) {
          console.error("Auth check failed:", error);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuth]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < BREAKPOINTS.desktop) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Mobile only */}
      <Header onMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        </div>

        {/* Mobile Sidebar - Sheet overlay */}
        <MobileSidebar
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        />

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            "w-full lg:w-auto",
            // Desktop margin based on sidebar state
            sidebarOpen ? "lg:ml-64" : "lg:ml-20",
            // Mobile - no margin, full width
            "ml-0",
          )}
        >
          <div className="container mx-auto p-4 sm:p-6 lg:p-7">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
