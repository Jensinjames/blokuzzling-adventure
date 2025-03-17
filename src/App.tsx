
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import SupabaseRealtimeProvider from '@/components/SupabaseRealtimeProvider';
import AuthProvider from '@/context/AuthProvider';
import DatabaseConnectionStatus from '@/components/DatabaseConnectionStatus';

// Import all pages
import Index from '@/pages/Index';
import Game from '@/pages/Game';
import Rules from '@/pages/Rules';
import Profile from '@/pages/Profile';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Home from '@/pages/Home';
import Settings from '@/pages/Settings';
import Lobby from '@/pages/Lobby';
import MultiplayerGame from '@/pages/MultiplayerGame';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="blockr-theme">
      <AuthProvider>
        <SupabaseRealtimeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/game" element={<Game />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/lobby/:id" element={<Lobby />} />
              <Route path="/multiplayer/:id" element={<MultiplayerGame />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <DatabaseConnectionStatus />
          <Toaster />
        </SupabaseRealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
