
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './router';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import MetaPixelLoader from './components/MetaPixelLoader';
import SupabaseRealtimeProvider from './components/SupabaseRealtimeProvider';
import DatabaseConnectionStatus from './components/DatabaseConnectionStatus';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SupabaseRealtimeProvider>
        <RouterProvider router={router} />
        <DatabaseConnectionStatus />
        <Toaster position="top-right" />
        {/* Facebook Meta Pixel is conditionally loaded only in production */}
        <MetaPixelLoader />
      </SupabaseRealtimeProvider>
    </ThemeProvider>
  );
}

export default App;
