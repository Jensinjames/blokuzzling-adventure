
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import AuthLayout from './components/auth/AuthLayout';
import Auth from './pages/Auth';
import Game from './pages/Game';
import Home from './pages/Home';
import Index from './pages/Index';
import Lobby from './pages/Lobby';
import MultiplayerGame from './pages/MultiplayerGame';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Rules from './pages/Rules';
import Settings from './pages/Settings';
import { SubscriptionGuard } from './components/auth/SubscriptionGuard';

// Define the router with routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: 'auth',
        element: 
          <AuthLayout 
            title="Welcome to BlokU"
            subtitle="Sign in to your account or create a new one to start playing"
          >
            <Auth />
          </AuthLayout>,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'game',
        element: <Game />,
      },
      {
        path: 'rules',
        element: <Rules />,
      },
      {
        path: 'lobby/:gameId',
        element: <Lobby />,
      },
      {
        path: 'multiplayer-game/:gameId',
        element: <MultiplayerGame />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'premium',
        element: 
          <SubscriptionGuard requiredTier="premium">
            <div className="container mx-auto py-8">
              <h1 className="text-2xl font-bold mb-4">Premium Content</h1>
              <p>This is premium content only available to premium subscribers.</p>
            </div>
          </SubscriptionGuard>,
      },
      {
        path: 'pro',
        element: 
          <SubscriptionGuard requiredTier="pro">
            <div className="container mx-auto py-8">
              <h1 className="text-2xl font-bold mb-4">Pro Content</h1>
              <p>This is pro content only available to pro subscribers.</p>
            </div>
          </SubscriptionGuard>,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
