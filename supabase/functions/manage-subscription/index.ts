
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Initialize client with anonymous key - for standard auth user operations
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Initialize admin client with service role key - for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Handle subscription updates
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'No authorization header provided'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Invalid token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse the request body
    const { tier, action } = await req.json()

    // Validate input
    if (!tier || !['free', 'basic', 'premium'].includes(tier)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid subscription tier'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!action || !['subscribe', 'cancel'].includes(action)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid action'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate expiry date (30 days from now for simplicity)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    // Update the user's profile with subscription information
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: action === 'subscribe' ? 'active' : 'cancelled',
        subscription_expiry: action === 'subscribe' ? expiryDate.toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return new Response(
        JSON.stringify({
          error: 'Failed to update subscription'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        data,
        message: action === 'subscribe' 
          ? `Successfully subscribed to ${tier} tier` 
          : `Successfully cancelled ${tier} subscription`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
