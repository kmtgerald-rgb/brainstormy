import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryPrompts: Record<string, string> = {
  insight: "This is a Consumer Insight card. Explain the psychological or behavioral principle behind this insight in 2-3 sentences. Give a brief real-world example of how brands have leveraged this.",
  asset: "This is an Existing Asset card. Explain why this asset is strategically valuable and how it could be leveraged for innovation in 2-3 sentences.",
  tech: "This is a New Technology card. Briefly explain this technology and its innovation potential in 2-3 sentences.",
  random: "This is a Random/Misc twist card. Explain how this unexpected element could transform or disrupt conventional thinking in 2-3 sentences.",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardText, category } = await req.json();

    if (!cardText || !category) {
      return new Response(
        JSON.stringify({ error: 'Missing cardText or category' }),
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
            content: `You are a strategic innovation consultant helping workshop participants understand brainstorming prompts. Be concise, insightful, and practical. Write in a confident, editorial tone.`
          },
          {
            role: 'user',
            content: `${categoryContext}\n\nCard text: "${cardText}"\n\nProvide a brief, insightful explanation.`
          }
        ],
        max_tokens: 200,
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
