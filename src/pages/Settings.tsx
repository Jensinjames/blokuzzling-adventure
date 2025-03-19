
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Settings = () => {
  const { user, subscription, refreshSession } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSubscription, setActiveSubscription] = useState<string>(subscription?.tier || 'free');
  const navigate = useNavigate();
  
  // Use auth check hook to ensure user is logged in
  useAuthCheck();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  const handleSubscriptionChange = async (tier: string) => {
    if (!user) {
      toast.error('You must be logged in to manage subscriptions');
      navigate('/auth');
      return;
    }
    
    try {
      setLoading(true);
      
      // If selecting same tier as current active subscription, cancel it
      const action = (subscription?.tier === tier && subscription?.isActive) ? 'cancel' : 'subscribe';
      
      // Call the manage-subscription edge function
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { tier, action },
      });
      
      if (error) {
        console.error('Error managing subscription:', error);
        toast.error(`Failed to ${action} subscription: ${error.message}`);
        return;
      }
      
      // Update local state
      setActiveSubscription(action === 'cancel' ? 'free' : tier);
      
      // Show success message
      toast.success(data.message);
      
      // Refresh session to update subscription details
      await refreshSession();
      
    } catch (error: any) {
      console.error('Error in subscription management:', error);
      toast.error(`An error occurred: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const tiers = [
    {
      name: 'Free',
      id: 'free',
      price: '$0',
      description: 'Basic access to play games',
      features: [
        'Play up to 10 games per day',
        'Access to standard game boards',
        'Basic player profile'
      ],
      isActive: subscription?.tier === 'free' || !subscription?.isActive
    },
    {
      name: 'Basic',
      id: 'basic',
      price: '$5.99',
      description: 'Enhanced gaming experience',
      features: [
        'Unlimited games',
        'Access to advanced game boards',
        'Priority matchmaking',
        'Game history tracking'
      ],
      isActive: subscription?.tier === 'basic' && subscription?.isActive
    },
    {
      name: 'Premium',
      id: 'premium',
      price: '$9.99',
      description: 'Ultimate BlokU experience',
      features: [
        'All Basic tier features',
        'Custom game themes',
        'Advanced analytics',
        'Early access to new features',
        'Ad-free experience'
      ],
      isActive: subscription?.tier === 'premium' && subscription?.isActive
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/home')}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-center dark:text-white">Subscription Settings</h1>
          <div className="w-10"></div>
        </header>
        
        {user ? (
          <>
            <Card className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-xl border border-white/20 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  Your current plan and subscription details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Plan:</span>
                    <span className="text-sm font-bold capitalize">{subscription?.tier || 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`text-sm font-bold ${subscription?.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {subscription?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {subscription?.expiry && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Expires:</span>
                      <span className="text-sm">{formatDate(subscription.expiry)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {tiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-xl border ${
                    tier.isActive 
                      ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-500/50' 
                      : 'border-white/20 dark:border-gray-700/30'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tier.name}
                      {tier.isActive && (
                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-baseline">
                      <span className="text-2xl font-extrabold tracking-tight">{tier.price}</span>
                      <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {tier.id !== 'free' ? '/month' : ''}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{tier.description}</p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={tier.isActive ? "outline" : "default"}
                      onClick={() => handleSubscriptionChange(tier.id)}
                      disabled={loading}
                    >
                      {loading && activeSubscription === tier.id ? (
                        <LoadingSpinner size="sm" />
                      ) : tier.isActive ? (
                        'Cancel Subscription'
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-1" />
                          {tier.id === 'free' ? 'Switch to Free' : `Subscribe to ${tier.name}`}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <Card className="mb-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-xl border border-white/20 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle>Subscription FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">How do I change my subscription?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Simply select the tier you want to subscribe to above. Your subscription will be updated immediately.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-1">When will I be charged?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is a demo application, so no actual charges will be processed. In a real application, 
                    you would be charged at the beginning of each billing cycle.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-1">Can I cancel anytime?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yes, you can cancel your subscription at any time. Your benefits will continue until the end of the current billing period.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
