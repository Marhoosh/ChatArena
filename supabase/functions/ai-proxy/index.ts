import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }


  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!

    // TODO：这里改为使用service_key?然后jwt keys看情况要不要迁移到新版的 
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User Unauthorized:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: usage, error: usageError } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (usageError && usageError.code !== 'PGRST116') {

      console.error('Usage query error:', usageError)

      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (usage && usage.basic_usage >= usage.basic_limit) {
      console.error('Daily limit exceeded for user:', user.id)
      return new Response(
        JSON.stringify({ error: 'Daily limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    const { messages, model, stream = true } = requestBody

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format')
      return new Response(
        JSON.stringify({ error: 'Invalid messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!model) {
      console.error('Model is required')
      return new Response(
        JSON.stringify({ error: 'Model is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    const openRouterEndpoint = Deno.env.get('OPENROUTER_API_ENDPOINT')

    if (!openRouterApiKey || !openRouterEndpoint) {
      console.error('OPENROUTER_API_KEY or OPENROUTER_API_ENDPOINT not configured')
      return new Response(
        JSON.stringify({ error: 'OpenRouter API or OPENROUTER_API_ENDPOINT not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(openRouterEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://chatarena.top',
        'X-Title': 'ChatArena',
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'OpenRouter API error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (stream && response.body) {
      const reader = response.body.getReader()
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            let usageIncremented = false

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              if (!usageIncremented) {
                await supabase.rpc('increment_usage', {
                  user_id: user.id,
                  usage_type: 'basic_usage',
                  increment_amount: 1
                })
                usageIncremented = true
              }

              controller.enqueue(value)
            }
          } catch (error) {
            console.error('Stream error:', error)
          } finally {
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      })
    }

    const data = await response.json()
    await supabase.rpc('increment_usage', {
      user_id: user.id,
      usage_type: 'basic_usage',
      increment_amount: 1
    })

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
