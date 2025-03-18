
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
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

type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggleMode, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  // Initialize react-hook-form
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
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
