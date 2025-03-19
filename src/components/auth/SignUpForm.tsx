
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
const signUpFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

interface SignUpFormProps {
  onSuccess: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();

  // Initialize react-hook-form
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: SignUpFormValues) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[Auth Debug] Attempting to sign up with email: ${values.email}`);
      
      const result = await signUp(values.email, values.password);
      if (result.error) {
        console.error('[Auth Debug] Sign up error:', result.error);
        
        if (result.error.message?.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (result.error.message?.includes('users') && result.error.message?.includes('exist')) {
          setError('Server configuration error. Please contact support.');
          console.error('[Auth Debug] Database configuration error:', result.error);
        } else {
          setError(result.error.message || 'An error occurred during sign up');
        }
      } else {
        console.log('[Auth Debug] Sign up successful');
        
        // Check if email confirmation is needed
        if (result.data?.user?.identities?.length === 0 || 
            !result.data?.user?.email_confirmed_at) {
          setError('Please check your email and click the confirmation link before signing in.');
        }
        
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
                    autoComplete="new-password"
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
                Signing up...
              </>
            ) : (
              <>Sign Up</>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
