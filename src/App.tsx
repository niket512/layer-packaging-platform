import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import SeoMetadata from "@/components/SeoMetadata";
const Team = lazy(() => import("./pages/Team.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const Designs = lazy(() => import("./pages/Designs.tsx"));
const PackagingGuides = lazy(() => import("./pages/PackagingGuides"));
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
const Index = lazy(() => import("./pages/Index.tsx"));
const Proposal = lazy(() => import("./pages/Proposal.tsx"));
const SignIn = lazy(() => import("./pages/SignIn.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Procure = lazy(() => import("./pages/Procure.tsx"));
const AppHome = lazy(() => import("./pages/AppHome.tsx"));
const AppStore = lazy(() => import("./pages/AppStore.tsx"));
const AppAdmin = lazy(() => import("./pages/AppAdmin.tsx"));
const AdminChats = lazy(() => import("./pages/AdminChats"));
const ManufacturerNetworkPage = lazy(() => import("./pages/ManufacturerNetwork"));
import SourcingAgent from "./pages/SourcingAgent.tsx";
const RequestPreview = lazy(() => import("./pages/RequestPreview"));
const SourcingThankYou = lazy(() => import("./pages/SourcingThankYou.tsx"));
import { useVisitorTracking } from "@/lib/visitor-tracking";

function VisitorTracking() { useVisitorTracking(); return null; }

const queryClient = new QueryClient();
const host = typeof window !== "undefined" ? window.location.hostname : "";
const isAppHost = host.startsWith("app.");

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SeoMetadata />
        <VisitorTracking />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={isAppHost ? <AppHome /> : <SourcingAgent requirementMode="form" />} />
          <Route path="/about" element={<Index />} />
          <Route path="/manufacturer-network" element={<ManufacturerNetworkPage />} />
          <Route path="/sourcing" element={<SourcingAgent />} />
          <Route path="/request" element={<RequestPreview />} />
          <Route path="/request-form" element={<SourcingAgent />} />
          <Route path="/sourcing/corrugated-boxes" element={<SourcingAgent category="corrugated-boxes" requirementMode="form" />} />
          <Route path="/sourcing/flexible-pouches" element={<SourcingAgent category="flexible-pouches" requirementMode="form" />} />
          <Route path="/sourcing/sachets" element={<SourcingAgent category="sachets" requirementMode="form" />} />
          <Route path="/sourcing/cosmetic-packaging" element={<SourcingAgent category="cosmetic-packaging" />} />
          <Route path="/sourcing/mailer-boxes" element={<SourcingAgent category="mailer-boxes" requirementMode="form" />} />
          <Route path="/sourcing/thank-you" element={<SourcingThankYou />} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
