
import React from 'react';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import Index from '@/pages/Index';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Game from '@/pages/Game';
import Lobby from '@/pages/Lobby';
import MultiplayerGame from '@/pages/MultiplayerGame';
import NotFound from '@/pages/NotFound';
import Rules from '@/pages/Rules';
import Settings from '@/pages/Settings';
import { AuthProvider } from '@/context/AuthProvider';
import { Toaster } from 'sonner';

// Create a root component that wraps the routes with AuthProvider
const AppRoot = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
    <Toaster position="top-center" />
  </AuthProvider>
);

// Define the router configuration with routes wrapped in AppRoot
const router = createHashRouter([
  {
    path: "/",
    element: <AppRoot><Index /></AppRoot>,
    errorElement: <AppRoot><NotFound /></AppRoot>,
  },
  {
    path: "/home",
    element: <AppRoot><Home /></AppRoot>,
  },
  {
    path: "/auth",
    element: <AppRoot><Auth /></AppRoot>,
  },
  {
    path: "/profile",
    element: <AppRoot><Profile /></AppRoot>,
  },
  {
    path: "/game/:gameId",
    element: <AppRoot><Game /></AppRoot>,
  },
  {
    path: "/lobby/:gameId",
    element: <AppRoot><Lobby /></AppRoot>,
  },
  {
    path: "/multiplayer/:gameId",
    element: <AppRoot><MultiplayerGame /></AppRoot>,
  },
  {
    path: "/settings",
    element: <AppRoot><Settings /></AppRoot>,
  },
  {
    path: "/rules",
    element: <AppRoot><Rules /></AppRoot>,
  },
  {
    path: "*",
    element: <AppRoot><NotFound /></AppRoot>,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
