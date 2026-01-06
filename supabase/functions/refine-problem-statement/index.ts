import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();

    // Input validation
    const minLength = 10;
    const maxLength = 2000;

    if (!context || typeof context !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Context is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (context.length < minLength) {
      return new Response(
        JSON.stringify({ error: `Context must be at least ${minLength} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (context.length > maxLength) {
      return new Response(
        JSON.stringify({ error: `Context must be less than ${maxLength} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Refining problem statement for context:', context.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a strategic innovation consultant. Transform raw brainstorming context into a clear, actionable problem statement.

Rules:
- Output ONLY the problem statement, nothing else
- Use "How Might We" format when appropriate
- Keep it to 1-2 sentences maximum
- Make it inspiring and open-ended to encourage creative thinking
- Include a measurable goal or target if one is provided
- Be concise but capture the essence of the challenge`
          },
          {
            role: 'user',
            content: `Transform this brainstorming context into a refined problem statement:\n\n${context}`
          }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const statement = data.choices?.[0]?.message?.content?.trim();

    if (!statement) {
      throw new Error('No statement generated');
    }

    console.log('Generated statement:', statement);

    return new Response(
      JSON.stringify({ statement }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error refining problem statement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to refine problem statement';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
