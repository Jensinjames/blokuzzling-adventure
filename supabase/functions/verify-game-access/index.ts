
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.14.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session of the user
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'You must be logged in to access this feature' 
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      return new Response(
        JSON.stringify({ 
          error: 'Profile not found',
          message: 'Unable to verify your account status' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // In a real application, check for subscription status here
    // For now, all authenticated users have access
    const hasSubscription = true

    // Parse request params
    const { gameId } = await req.json()

    // If no gameId was provided, just verify the user has authorization
    if (!gameId) {
      return new Response(
        JSON.stringify({ 
          success: true,
          hasSubscription,
          user: {
            id: session.user.id,
            email: session.user.email,
            username: profile.username,
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If a gameId was provided, check if the user has access to this game
    const { data: playerData, error: playerError } = await supabaseClient
      .from('game_players')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_id', session.user.id)

    const isPlayer = (playerData && playerData.length > 0)

    // Check if the user is the creator of the game
    const { data: gameData, error: gameError } = await supabaseClient
      .from('game_sessions')
      .select('*')
      .eq('id', gameId)
      .single()

    const isCreator = (gameData && gameData.creator_id === session.user.id)

    if (!isPlayer && !isCreator) {
      return new Response(
        JSON.stringify({ 
          error: 'Access denied',
          message: 'You do not have access to this game' 
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        hasSubscription,
        isPlayer,
        isCreator,
        user: {
          id: session.user.id,
          email: session.user.email,
          username: profile.username,
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
