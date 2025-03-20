
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
    const origin = req.headers.get("origin") || "";
    // Ensure we have a proper site URL without hash routing
    const siteUrl = Deno.env.get("SITE_URL") || origin;
    
    console.log(`Processing auth action: ${action} for email: ${email}`);
    console.log(`Using site URL: ${siteUrl}`);
    console.log(`Request origin: ${origin}`);

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

      // Determine appropriate redirect URL based on environment
      // For local development with hash routing use /#/auth format
      // For production deployments use /auth format
      const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
      const redirectPath = isLocalhost ? 
        `${siteUrl}/#/auth?confirmation=true` : 
        `${siteUrl}/auth?confirmation=true`;
        
      console.log(`Using redirect path for confirmation: ${redirectPath}`);
        
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        options: {
          redirectTo: redirectPath,
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
      // Determine appropriate redirect URL based on environment
      // For local development with hash routing use /#/auth format
      // For production deployments use /auth format
      const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
      const redirectPath = isLocalhost ? 
        `${siteUrl}/#/auth?magic-link=true` : 
        `${siteUrl}/auth?magic-link=true`;
        
      console.log(`Using redirect path for magic link: ${redirectPath}`);
        
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: redirectPath,
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
