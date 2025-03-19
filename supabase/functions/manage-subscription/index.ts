
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // Get the authorization token from the request
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Create authenticated Supabase client with the user's JWT
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Get user data from the token to verify identity
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: userError }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse the request data
    const { action, subscriptionData } = await req.json()

    // Handle different actions
    switch (action) {
      case 'check':
        // Retrieve the user's current subscription
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status, subscription_expiry')
          .eq('id', user.id)
          .single()

        if (profileError) {
          return new Response(
            JSON.stringify({
              error: 'Failed to fetch subscription data',
              details: profileError,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Check if the subscription is active and not expired
        const isActive =
          profile.subscription_status === 'active' &&
          (!profile.subscription_expiry ||
            new Date(profile.subscription_expiry) > new Date())

        return new Response(
          JSON.stringify({
            subscription: {
              ...profile,
              isActive,
              isPremium: profile.subscription_tier === 'premium' && isActive,
            },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      case 'update':
        // Update the user's subscription status
        if (!subscriptionData) {
          return new Response(
            JSON.stringify({ error: 'No subscription data provided' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: subscriptionData.tier,
            subscription_status: subscriptionData.status,
            subscription_expiry: subscriptionData.expiry,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({
              error: 'Failed to update subscription',
              details: updateError,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({
            message: 'Subscription updated successfully',
            subscription: updateData,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action requested' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }
  } catch (error) {
    console.error('Error handling request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
