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

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;

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
