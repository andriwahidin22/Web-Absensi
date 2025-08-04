
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSidebar from "./components/AdminSidebar";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKaryawan from "./pages/AdminKaryawan";
import AdminAbsensi from "./pages/AdminAbsensi";
import AdminValidasi from "./pages/AdminValidasi";
import AdminSP from "./pages/AdminSP";
import AdminLaporan from "./pages/AdminLaporan";
import AdminSettings from "./pages/AdminSettings";
import BosDashboard from "./pages/BosDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Admin Routes with Sidebar */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <div className="flex h-screen bg-background">
                    <AdminSidebar />
                    <main className="flex-1 overflow-auto p-6">
                      <ErrorBoundary>
                        <Routes>
                          <Route index element={<AdminDashboard />} />
                          <Route path="karyawan" element={<AdminKaryawan />} />
                          <Route path="absensi" element={<AdminAbsensi />} />
                          <Route path="validasi" element={<AdminValidasi />} />
                          <Route path="sp" element={<AdminSP />} />
                          <Route path="laporan" element={<AdminLaporan />} />
                          <Route path="statistik" element={<div>Statistik (Coming Soon)</div>} />
                          <Route path="settings" element={<AdminSettings />} />
                        </Routes>
                      </ErrorBoundary>
                    </main>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/bos" 
              element={
                <ProtectedRoute requiredRole="BOS">
                  <BosDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
