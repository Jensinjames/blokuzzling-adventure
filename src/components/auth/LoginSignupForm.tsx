
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

const authFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormValues = z.infer<typeof authFormSchema>;

interface LoginSignupFormProps {
  isLogin: boolean;
  onForgotPassword: () => void;
}

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({ 
  isLogin,
  onForgotPassword,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: AuthFormValues) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[Auth Debug] Attempting to ${isLogin ? 'sign in' : 'sign up'} with email: ${values.email}`);
      
      if (isLogin) {
        const result = await signIn(values.email, values.password);
        if (result.error) {
          console.error('[Auth Debug] Sign in error:', result.error);
          
          // Improved error handling with more specific messages
          if (result.error.message.includes('Email not confirmed')) {
            setError('Please confirm your email address before signing in. Check your inbox for a confirmation link.');
            toast.error('Email not confirmed. Please check your inbox.');
          } else if (result.error.message.includes('Invalid login credentials')) {
            setError('The email or password you entered is incorrect.');
            toast.error('Invalid login credentials. Please try again.');
          } else if (result.error.message.includes('rate limit')) {
            setError('Too many attempts. Please try again later.');
            toast.error('Too many login attempts. Please try again later.');
          } else {
            setError(result.error.message || 'An error occurred during sign in');
            toast.error(`Sign in failed: ${result.error.message || 'An unknown error occurred'}`);
          }
        } else {
          console.log('[Auth Debug] Sign in successful');
        }
      } else {
        const result = await signUp(values.email, values.password);
        if (result.error) {
          console.error('[Auth Debug] Sign up error:', result.error);
          
          if (result.error.message?.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
            toast.error('This email is already registered');
          } else if (result.error.message?.includes('users') && result.error.message?.includes('exist')) {
            setError('Server configuration error. Please contact support.');
            toast.error('Server configuration error');
            console.error('[Auth Debug] Database configuration error:', result.error);
          } else if (result.error.message?.includes('strong password')) {
            setError('Please use a stronger password with at least one number and one special character.');
            toast.error('Password is too weak');
          } else {
            setError(result.error.message || 'An error occurred during sign up');
            toast.error(`Sign up failed: ${result.error.message || 'An unknown error occurred'}`);
          }
        } else {
          console.log('[Auth Debug] Sign up successful');
          
          if (result.data?.user?.identities?.length === 0 || 
              !result.data?.user?.email_confirmed_at) {
            toast.info('Please check your email to confirm your account before signing in.');
            setError('Please check your email and click the confirmation link before signing in.');
          } else {
            toast.success('Account created successfully!');
          }
        }
      }
    } catch (error: any) {
      console.error('[Auth Debug] Authentication error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(`Authentication error: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="auth-email">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="auth-email"
                    type="email"
                    placeholder="your.email@example.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="auth-password">Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Signing in...' : 'Signing up...'}
              </>
            ) : (
              <>{isLogin ? 'Sign In' : 'Sign Up'}</>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default LoginSignupForm;
