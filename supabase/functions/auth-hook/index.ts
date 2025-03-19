
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

// Add CORS headers for the auth hook
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main serve function for the auth hook
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, type } = await req.json();
    console.log(`Auth webhook received: ${type}`, event);

    // Process different auth events
    if (type === 'signup') {
      // You could add custom signup validation here
      console.log('New user signed up', event?.user?.id);
      
      // Example: Initialize user profile on signup
      // This could be done here or in a separate database trigger
    } else if (type === 'login') {
      // You could add custom login logic here
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
