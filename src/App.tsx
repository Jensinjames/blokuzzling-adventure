
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './router';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthProvider';
import MetaPixelLoader from './components/MetaPixelLoader';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
      {/* Facebook Meta Pixel is conditionally loaded only in production */}
      <MetaPixelLoader />
    </ThemeProvider>
  );
}

export default App;
