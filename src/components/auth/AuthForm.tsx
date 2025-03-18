
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

// Define validation schema
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
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggleMode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  // Initialize react-hook-form for auth
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Initialize react-hook-form for password reset
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
          setError(result.error.message || 'Invalid login credentials');
          toast.error(`Sign in failed: ${result.error.message || 'Invalid login credentials'}`);
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
          toast.success('Account created! Check your email for confirmation.');
          onSuccess();
          // Switch to login mode after successful signup
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
        // Switch back to login mode after successful password reset request
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
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
