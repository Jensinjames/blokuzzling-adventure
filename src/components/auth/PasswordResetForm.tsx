
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthErrorDisplay } from './AuthErrorDisplay';

// Define validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBackToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  // Initialize react-hook-form
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = async (values: ResetPasswordValues) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Auth Debug] Attempting to reset password for email:', values.email);
      
      const { error } = await resetPassword(values.email);
      
      if (error) {
        console.error('[Auth Debug] Password reset error:', error);
        setError(error.message || 'Failed to send password reset email');
      } else {
        console.log('[Auth Debug] Password reset email sent successfully');
        onBackToLogin();
      }
    } catch (error: any) {
      console.error('[Auth Debug] Password reset error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-center">Reset Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <AuthErrorDisplay error={error} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
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
          onClick={onBackToLogin}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          disabled={loading}
        >
          Back to login
        </button>
      </div>
    </>
  );
};
