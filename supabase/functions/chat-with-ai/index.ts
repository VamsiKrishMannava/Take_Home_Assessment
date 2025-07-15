import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, context } = await req.json();

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    console.log('Checking API key configuration...');
    console.log('API key exists:', !!anthropicApiKey);
    console.log('API key format valid:', anthropicApiKey?.startsWith('sk-ant-'));
    
    if (!anthropicApiKey) {
      console.error('No Anthropic API key found in environment variables');
      const availableKeys = Object.keys(Deno.env.toObject()).filter(key => 
        key.toLowerCase().includes('anthropic') || key.toLowerCase().includes('api')
      );
      console.log('Available API-related keys:', availableKeys);
      
      return new Response(JSON.stringify({ 
        error: 'API key not configured',
        debug: `No Anthropic API key found. Available keys: ${availableKeys.join(', ')}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate API key format
    if (!anthropicApiKey.startsWith('sk-ant-')) {
      console.error('Invalid API key format - should start with sk-ant-');
      return new Response(JSON.stringify({ 
        error: 'Invalid API key format',
        debug: `API key should start with 'sk-ant-' but starts with '${anthropicApiKey.substring(0, 7)}'`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to Anthropic API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `${context ? `Context: ${context}\n\n` : ''}${message}`
          }
        ],
      }),
    });

    console.log('Anthropic API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Anthropic API response received successfully');
    
    const aiResponse = data.content[0].text;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});