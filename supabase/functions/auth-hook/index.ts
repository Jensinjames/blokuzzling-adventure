
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, type } = await req.json();
    console.log(`Auth webhook received: ${type}`, event);

    // This is a replacement for the Auth0 hook
    // Here we can add custom logic for auth events (signup, login, etc.)
    // For now, we're just logging the event and returning success
    
    // Example: Add custom claims or validation
    if (type === 'signup') {
      // We could add custom signup validation here
      console.log('New user signed up', event?.user?.id);
    } else if (type === 'login') {
      // We could add custom login logic here
      console.log('User logged in', event?.user?.id);
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Auth hook processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing auth hook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to process auth hook' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }
});
