import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/layout/Header";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ElectionsPage from "./pages/ElectionsPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreateElectionPage from "./pages/CreateElectionPage";
import StudentsManagementPage from "./pages/StudentsManagementPage";
import StudentValidatorPage from "./pages/StudentValidatorPage";
import ElectionDetailsPage from "./pages/ElectionDetailsPage";
import VotePage from "./pages/VotePage";
import ResultsPage from "./pages/ResultsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="election-ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/elections" element={
                  <ProtectedRoute>
                    <ElectionsPage />
                  </ProtectedRoute>
                } />
                <Route path="/elections/:id" element={
                  <ProtectedRoute>
                    <ElectionDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/elections/:id/vote" element={
                  <ProtectedRoute requireRole="user">
                    <VotePage />
                  </ProtectedRoute>
                } />
                <Route path="/elections/:id/results" element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requireRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/create-election" element={
                  <ProtectedRoute requireRole="admin">
                    <CreateElectionPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/students" element={
                  <ProtectedRoute requireRole="admin">
                    <StudentsManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/student-validator" element={
                  <ProtectedRoute requireRole="admin">
                    <StudentValidatorPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/elections/:id" element={
                  <ProtectedRoute requireRole="admin">
                    <ElectionDetailsPage />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
