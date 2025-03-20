
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const resendSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResendFormValues = z.infer<typeof resendSchema>;

const ResendConfirmation: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleResend = async (values: ResendFormValues) => {
    setLoading(true);
    try {
      console.log('Sending confirmation email resend request for:', values.email);
      
      // Call the edge function
      const { error, data } = await supabase.functions.invoke('auth-email-handler', {
        body: { 
          action: 'resend-confirmation', 
          email: values.email 
        }
      });

      console.log('Response from edge function:', { error, data });

      if (error) {
        console.error('Error resending confirmation:', error);
        toast.error('Failed to resend confirmation email');
      } else {
        toast.success('Confirmation email resent. Please check your inbox');
        form.reset();
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Resend Confirmation Email</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Didn't receive a confirmation email? Enter your email to resend it.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleResend)} className="space-y-4">
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
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Confirmation Email
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResendConfirmation;
