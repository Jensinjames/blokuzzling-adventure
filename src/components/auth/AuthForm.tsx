import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const authFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type AuthFormValues = z.infer<typeof authFormSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
  onSuccess: () => void;
  onGoogleSignIn?: () => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggleMode, onSuccess, onGoogleSignIn }) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
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
          
          if (result.error.message.includes('Email not confirmed')) {
            setError('Please confirm your email address before signing in. Check your inbox for a confirmation link.');
            toast.error('Email not confirmed. Please check your inbox.');
          } else {
            setError(result.error.message || 'Invalid login credentials');
            toast.error(`Sign in failed: ${result.error.message || 'Invalid login credentials'}`);
          }
        } else {
          console.log('[Auth Debug] Sign in successful');
          onSuccess();
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
          
          onSuccess();
          if (!isLogin) {
            onToggleMode();
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

  const handleResetPassword = async (values: ResetPasswordValues) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Auth Debug] Attempting to reset password for email:', values.email);
      
      const { error } = await resetPassword(values.email);
      
      if (error) {
        console.error('[Auth Debug] Password reset error:', error);
        setError(error.message || 'Failed to send password reset email');
        toast.error(`Password reset failed: ${error.message || 'Failed to send reset email'}`);
      } else {
        console.log('[Auth Debug] Password reset email sent successfully');
        toast.success('Password reset email sent. Please check your inbox.');
        setIsForgotPassword(false);
      }
    } catch (error: any) {
      console.error('[Auth Debug] Password reset error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(`Password reset error: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      console.log('[Auth Debug] Attempting to sign in with Google');
      
      if (onGoogleSignIn) {
        await onGoogleSignIn();
      } else {
        toast.error('Google sign in is not configured properly');
      }
    } catch (error: any) {
      console.error('[Auth Debug] Google sign in error:', error);
      setError(error.message || 'An unexpected error occurred');
      toast.error(`Google sign in error: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setError(null);
  };

  if (isForgotPassword) {
    return (
      <>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-300 text-sm flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-center">Reset Password</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
            <FormField
              control={resetForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="reset-email">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="reset-email"
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

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleForgotPassword}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            disabled={loading}
          >
            Back to login
          </button>
        </div>
      </>
    );
  }

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
                onClick={toggleForgotPassword}
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
            disabled={loading || googleLoading}
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full flex justify-center items-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
      </Button>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          disabled={loading}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </>
  );
};

export default AuthForm;
