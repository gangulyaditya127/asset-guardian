import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SyncProvider } from "@/context/SyncContext";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Gaps from "./pages/Gaps";
import Logs from "./pages/Logs";
import SettingsPage from "./pages/Settings";
import RecordDetail from "./pages/RecordDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SyncProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/gaps" element={<Gaps />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SyncProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
