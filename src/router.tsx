
import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import AuthLayout from './components/auth/AuthLayout';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { SubscriptionGuard } from './components/auth/SubscriptionGuard';
import AuthDebugPanel from './components/auth/AuthDebugPanel';
import { AuthProvider } from './context/AuthProvider';

// Lazy load non-critical pages
const Game = React.lazy(() => import('./pages/Game'));
const Home = React.lazy(() => import('./pages/Home'));
const Index = React.lazy(() => import('./pages/Index'));
const Lobby = React.lazy(() => import('./pages/Lobby'));
const MultiplayerGame = React.lazy(() => import('./pages/MultiplayerGame'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Rules = React.lazy(() => import('./pages/Rules'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Loading fallback for lazy-loaded components
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Layout component that includes AuthProvider and AuthDebugPanel
const MainLayout = () => {
  // This helps us avoid infinite loops by preventing re-renders of AuthProvider
  console.log('[Router] Rendering MainLayout');
  
  return (
    <AuthProvider>
      <>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
        {/* Debug panel only shown in development */}
        {import.meta.env.DEV && <AuthDebugPanel show={true} />}
      </>
    </AuthProvider>
  );
};

// Define the router with routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
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
