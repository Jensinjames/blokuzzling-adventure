
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, hasSubscription, subscription } = useAuth();
  
  const handleSubscribe = async (tier: 'standard' | 'premium') => {
    try {
      // Placeholder for subscription logic
      // In a real implementation, this would redirect to a payment processor
      toast.info(`Redirecting to payment for ${tier} subscription`);
      
      // Example of how you might handle this with a real implementation:
      // window.location.href = `https://your-payment-processor.com/subscribe?tier=${tier}&user=${user?.id}`;
      
      // For demo purposes, just show a success message
      setTimeout(() => {
        toast.success(`Subscribed to ${tier} tier successfully!`);
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-3xl font-bold text-center mb-2">BloKu Subscription</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-10">
          Get more features with a BloKu subscription
        </p>
        
        {hasSubscription ? (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center mb-10">
            <h2 className="text-xl font-semibold mb-2">You're Subscribed!</h2>
            <p>
              You have an active <span className="font-bold">{subscription?.tier || 'standard'}</span> subscription.
              {subscription?.expiresAt && (
                <> Renews on {new Date(subscription.expiresAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
        ) : null}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Plan</CardTitle>
              <CardDescription>For casual players</CardDescription>
              <div className="text-3xl font-bold mt-2">$5.99/mo</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited games</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Multiplayer mode</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Game history</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('standard')}
                disabled={hasSubscription && (subscription?.tier === 'standard' || subscription?.tier === 'premium')}
              >
                {hasSubscription 
                  ? subscription?.tier === 'standard' || subscription?.tier === 'premium'
                    ? 'Current Plan'
                    : 'Subscribe'
                  : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-primary">
            <CardHeader>
              <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full w-fit mb-2">
                BEST VALUE
              </div>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>For serious players</CardDescription>
              <div className="text-3xl font-bold mt-2">$9.99/mo</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>All Standard features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced game statistics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Tournament mode</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Custom game themes</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="default"
                onClick={() => handleSubscribe('premium')}
                disabled={hasSubscription && subscription?.tier === 'premium'}
              >
                {hasSubscription && subscription?.tier === 'premium'
                  ? 'Current Plan'
                  : subscription?.tier === 'standard'
                    ? 'Upgrade'
                    : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
