import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Team from "./pages/Team.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Proposal from "./pages/Proposal.tsx";
import SignIn from "./pages/SignIn.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Procure from "./pages/Procure.tsx";
import AppHome from "./pages/AppHome.tsx";
import AppStore from "./pages/AppStore.tsx";
import AppAdmin from "./pages/AppAdmin.tsx";
import ManufacturersDirectory from "./pages/ManufacturersDirectory.tsx";
import ManufacturerProfile from "./pages/ManufacturerProfile.tsx";
import SourcingAgent from "./pages/SourcingAgent.tsx";

const queryClient = new QueryClient();
const host = typeof window !== "undefined" ? window.location.hostname : "";
const isAppHost = host.startsWith("app.");
const isMfrHost = host.startsWith("manufacturers.") || host.startsWith("makers.");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isMfrHost ? <ManufacturersDirectory /> : isAppHost ? <AppHome /> : <Index />} />
          <Route path="/manufacturers" element={<ManufacturersDirectory />} />
          <Route path="/sourcing" element={<SourcingAgent />} />
          <Route path="/manufacturers/:slug" element={<ManufacturerProfile />} />
          <Route path="/app" element={<AppHome />} />
          <Route path="/app/store" element={<AppStore />} />
          <Route path="/app/admin" element={<AppAdmin />} />
          <Route path="/store" element={<AppStore />} />
          <Route path="/admin" element={<AppAdmin />} />
          <Route path="/proposal" element={<Proposal />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard/procure" element={<Procure />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:brandSlug" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
