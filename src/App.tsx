
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './router';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthProvider';
import MetaPixelLoader from './components/MetaPixelLoader';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
        {/* Facebook Meta Pixel is conditionally loaded only in production */}
        <MetaPixelLoader />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
