import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import VoterRegistration from "./pages/VoterRegistration";
import VoterVerification from "./pages/VoterVerification";
import VotingBallot from "./pages/VotingBallot";
import CreateElection from "./pages/CreateElection";
import EditElection from "./pages/EditElection";
import VoterManagement from "./pages/VoterManagement";
import ResearchReport from "./pages/ResearchReport";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<VoterRegistration />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/elections/new" element={
            <AdminProtectedRoute>
              <CreateElection />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/elections/:id/edit" element={
            <AdminProtectedRoute>
              <EditElection />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/voters" element={
            <AdminProtectedRoute>
              <VoterManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/vote" element={<VoterVerification />} />
          <Route path="/vote/ballot" element={<VotingBallot />} />
          <Route path="/research-report" element={<ResearchReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
