
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresSubscription?: boolean;
}

/**
 * Component that protects routes based on authentication and subscription status
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
  requiresSubscription = false,
}) => {
  const { user, loading, hasSubscription, checkingSubscription } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading || checkingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If auth is required and user is not logged in, redirect to login
  if (requiresAuth && !user) {
    toast.error("You must be logged in to access this page");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If subscription is required but user doesn't have one, redirect to subscription page
  if (requiresSubscription && !hasSubscription) {
    toast.error("This content requires a subscription");
    return <Navigate to="/subscription" state={{ from: location }} replace />;
  }

  // If all conditions are met, render the protected content
  return <>{children}</>;
};
