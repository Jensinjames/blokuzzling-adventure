
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email } = await req.json();
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get site URL from environment or use a default
    const siteUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "";
    
    console.log(`Processing auth action: ${action} for email: ${email}`);
    console.log(`Using site URL: ${siteUrl}`);

    if (action === "resend-confirmation") {
      // Get user by email
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      
      if (userError) {
        console.error("Error getting user:", userError);
        return new Response(JSON.stringify({ 
          error: "User not found" 
        }), { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // Resend confirmation email with proper redirect
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        options: {
          redirectTo: `${siteUrl}/auth?confirmation=true`,
        }
      });

      if (error) {
        console.error("Error resending confirmation:", error);
        return new Response(JSON.stringify({ 
          error: error.message 
        }), { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Confirmation email resent" 
      }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    } else if (action === "send-magic-link") {
      // Send a magic link for passwordless login
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${siteUrl}/auth?magic-link=true`,
        }
      });

      if (error) {
        console.error("Error sending magic link:", error);
        return new Response(JSON.stringify({ 
          error: error.message 
        }), { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Magic link sent" 
      }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    } else if (action === "verify-subscription") {
      // This would verify if a user has an active subscription
      // For simplicity, we'll just check if the user exists and return true
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      
      if (userError || !user) {
        return new Response(JSON.stringify({ 
          hasSubscription: false 
        }), { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      // In a real implementation, you would check your subscription database
      // For this example, we'll just return true for all authenticated users
      return new Response(JSON.stringify({ 
        hasSubscription: true 
      }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    return new Response(JSON.stringify({ 
      error: "Invalid action" 
    }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
