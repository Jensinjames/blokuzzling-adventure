
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthErrorDisplay } from './AuthErrorDisplay';

// Define validation schema
const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onForgotPassword }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  // Initialize react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[Auth Debug] Attempting to sign in with email: ${values.email}`);
      
      const result = await signIn(values.email, values.password);
      if (result.error) {
        console.error('[Auth Debug] Sign in error:', result.error);
        
        if (result.error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in. Check your inbox for a confirmation link.');
        } else {
          setError(result.error.message || 'Invalid login credentials');
        }
      } else {
        console.log('[Auth Debug] Sign in successful');
        onSuccess();
      }
    } catch (error: any) {
      console.error('[Auth Debug] Authentication error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthErrorDisplay error={error} />

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
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>Sign In</>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
