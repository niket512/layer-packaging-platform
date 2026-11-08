import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SeoMetadata from "@/components/SeoMetadata";
import Team from "./pages/Team.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import Designs from "./pages/Designs.tsx";
import PackagingGuides from "./pages/PackagingGuides";
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
import AdminChats from "./pages/AdminChats";
import ManufacturersDirectory from "./pages/ManufacturersDirectory.tsx";
import ManufacturerProfile from "./pages/ManufacturerProfile.tsx";
import ManufacturerNetworkPage from "./pages/ManufacturerNetwork";
import SourcingAgent from "./pages/SourcingAgent.tsx";
import SourcingThankYou from "./pages/SourcingThankYou.tsx";
import { useVisitorTracking } from "@/lib/visitor-tracking";

function VisitorTracking() { useVisitorTracking(); return null; }

const queryClient = new QueryClient();
const host = typeof window !== "undefined" ? window.location.hostname : "";
const isAppHost = host.startsWith("app.");
const isMfrHost = host.startsWith("manufacturers.") || host.startsWith("makers.");

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SeoMetadata />
        <VisitorTracking />
        <Routes>
          <Route path="/" element={isMfrHost ? <ManufacturersDirectory /> : isAppHost ? <AppHome /> : <SourcingAgent />} />
          <Route path="/about" element={<Index />} />
          <Route path="/manufacturers" element={<ManufacturersDirectory />} />
          <Route path="/manufacturer-network" element={<ManufacturerNetworkPage />} />
          <Route path="/sourcing" element={<SourcingAgent />} />
          <Route path="/sourcing/corrugated-boxes" element={<SourcingAgent category="corrugated-boxes" />} />
          <Route path="/sourcing/flexible-pouches" element={<SourcingAgent category="flexible-pouches" />} />
          <Route path="/sourcing/sachets" element={<SourcingAgent category="sachets" />} />
          <Route path="/sourcing/cosmetic-packaging" element={<SourcingAgent category="cosmetic-packaging" />} />
          <Route path="/sourcing/mailer-boxes" element={<SourcingAgent category="mailer-boxes" />} />
          <Route path="/sourcing/thank-you" element={<SourcingThankYou />} />
          <Route path="/manufacturers/:slug" element={<ManufacturerProfile />} />
          <Route path="/app" element={<AppHome />} />
          <Route path="/app/store" element={<AppStore />} />
          <Route path="/app/admin" element={<AppAdmin />} />
          <Route path="/store" element={<AppStore />} />
          <Route path="/admin" element={<AppAdmin />} />
          <Route path="/admin/chats" element={<AdminChats />} />
          <Route path="/app/admin/chats" element={<AdminChats />} />
          <Route path="/proposal" element={<Proposal />} />
          <Route path="/team" element={<Team />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/designs" element={<Designs />} />
          <Route path="/blog" element={<PackagingGuides />} />
          <Route path="/blog/:slug" element={<PackagingGuides />} />
          <Route path="/designs/flexible-pouches" element={<Designs onlyFamily="pouches" />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard/procure" element={<Procure />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bottles" element={<Dashboard />} />
          <Route path="/dashboard/gramiyaa" element={<Navigate to="/bottles" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
