import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Median.co Push Notification Auto-Registration
    const initPush = () => {
      if (window.median && window.median.onesignal) {
        try {
          // Equivalent to OneSignal.initialize + register
          window.median.onesignal.register();
          // Show notifications even when app is open
          window.median.onesignal.enableForegroundNotifications(true);
          console.log("Median Push Notifications Initialized");
        } catch (err) {
          console.error("Failed to init Median bridge:", err);
        }
      }
    };

    // Small delay to ensure bridge is injected
    const timer = setTimeout(initPush, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
