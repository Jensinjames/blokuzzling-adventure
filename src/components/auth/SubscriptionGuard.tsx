import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockIcon, AlertTriangleIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredTier?: 'basic' | 'premium' | 'pro';
  fallbackPath?: string;
}

/**
 * A component that protects routes based on the user's subscription status
 * If the user doesn't have the required subscription tier, they will be redirected
 * or shown an upgrade prompt
 */
export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiredTier = 'basic',
  fallbackPath = '/home'
}) => {
  const { user, loading, subscription } = useAuth();
  const location = useLocation();

  // Allow access while still loading auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to auth page
  if (!user) {
    toast.error('You need to be logged in to access this page');
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check if user has the required subscription tier
  const hasRequiredTier = () => {
    if (requiredTier === 'basic') {
      return subscription.isBasicOrHigher;
    } else if (requiredTier === 'premium') {
      return subscription.isPremium;
    } else if (requiredTier === 'pro') {
      return subscription.tier === 'pro';
    }
    return false;
  };

  // If user has required tier, render children
  if (hasRequiredTier()) {
    return <>{children}</>;
  }

  // Otherwise show subscription upgrade prompt
  return (
    <div className="container max-w-2xl mx-auto p-6 flex flex-col items-center">
      <Card className="w-full p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4">
            <LockIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold">Subscription Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            This content requires a {requiredTier} subscription.
          </p>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg my-6 flex gap-3">
          <AlertTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Your current subscription tier: <strong>{subscription.tier || 'Free'}</strong>
            </p>
            {subscription.expiry && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Expires: {new Date(subscription.expiry).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = fallbackPath}
          >
            Go Back
          </Button>
          <Button 
            onClick={() => window.location.href = '/settings/subscription'}
          >
            Upgrade Subscription
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;
