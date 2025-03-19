
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

// Add the new Settings route to the router configuration
const router = createHashRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
  {
    path: "/lobby/:gameId",
    element: <Lobby />,
  },
  {
    path: "/multiplayer/:gameId",
    element: <MultiplayerGame />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/rules",
    element: <Rules />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;
