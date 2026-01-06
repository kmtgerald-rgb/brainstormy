import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryPrompts: Record<string, string> = {
  insight: "Consumer Insight card. Give ONE punchy sentence on the psychology behind this (max 80 chars).",
  asset: "Existing Asset card. ONE sentence on why this is strategically valuable (max 80 chars).",
  tech: "New Technology card. ONE sentence on its innovation potential (max 80 chars).",
  random: "Random twist card. ONE sentence on how this disrupts thinking (max 80 chars).",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardText, category } = await req.json();

    // Input validation
    const validCategories = ['insight', 'asset', 'tech', 'random'];
    const maxCardLength = 500;

    if (!cardText || typeof cardText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid cardText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cardText.length > maxCardLength) {
      return new Response(
        JSON.stringify({ error: `Card text exceeds maximum length of ${maxCardLength}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!category || typeof category !== 'string' || !validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Invalid category. Must be: insight, asset, tech, or random' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const categoryContext = categoryPrompts[category] || categoryPrompts.random;

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
            content: `You are a strategic innovation consultant. Respond with ONE short, punchy sentence only. Max 80 characters. No fluff.`
          },
          {
            role: 'user',
            content: `${categoryContext}\n\nCard: "${cardText}"`
          }
        ],
        max_tokens: 60,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim() || 'No explanation available.';

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-card function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
