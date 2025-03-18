
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Game from './pages/Game';
import MultiplayerGame from './pages/MultiplayerGame';
import Lobby from './pages/Lobby';
import Rules from './pages/Rules';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthProvider';
import SupabaseRealtimeProvider from './components/SupabaseRealtimeProvider';
import DatabaseConnectionStatus from './components/DatabaseConnectionStatus';
import MetaPixelLoader from './components/MetaPixelLoader';

// Wrapper component with authentication and navigation
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <SupabaseRealtimeProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/multiplayer/:gameId" element={<MultiplayerGame />} />
          <Route path="/lobby/:gameId" element={<Lobby />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/profile/:username?" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DatabaseConnectionStatus />
        <Toaster />
      </SupabaseRealtimeProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <AppWithAuth />
        {/* Facebook Meta Pixel is conditionally loaded only in production */}
        <MetaPixelLoader />
      </Router>
    </ThemeProvider>
  );
}

export default App;
