import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PecasGraficas from "./pages/PecasGraficas";
import SolicitacaoSpot from "./pages/SolicitacaoSpot";
import MaterialExplicativo from "./pages/MaterialExplicativo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/campanha/:campanhaId/pecas-graficas" element={
                <ProtectedRoute>
                  <PecasGraficas />
                </ProtectedRoute>
              } />
              <Route path="/campanha/:campanhaId/solicitacao-spot" element={
                <ProtectedRoute>
                  <SolicitacaoSpot />
                </ProtectedRoute>
              } />
              <Route path="/campanha/:campanhaId/material-explicativo" element={
                <ProtectedRoute>
                  <MaterialExplicativo />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
