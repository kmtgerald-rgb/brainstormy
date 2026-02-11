import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const focusTypePrompts: Record<string, string> = {
  hmw: `You are a strategic innovation consultant. Transform raw brainstorming context into a clear, actionable problem statement.

Rules:
- Output ONLY the problem statement, nothing else
- Use "How Might We" format when appropriate
- Keep it to 1-2 sentences maximum
- Make it inspiring and open-ended to encourage creative thinking
- Include a measurable goal or target if one is provided
- Be concise but capture the essence of the challenge`,

  campaign: `You are a senior creative director at a top agency. Transform raw brainstorming context into a sharp campaign brief direction.

Rules:
- Output ONLY the campaign direction statement, nothing else
- Frame it as a campaign objective with a target audience and desired outcome
- Keep it to 1-2 sentences maximum
- Make it bold, distinctive, and actionable
- Focus on the strategic tension or cultural insight that drives the campaign`,

  content: `You are a content strategist at a leading media company. Transform raw brainstorming context into a compelling content concept.

Rules:
- Output ONLY the content concept, nothing else
- Frame it as a content piece with a clear angle and audience
- Keep it to 1-2 sentences maximum
- Make it specific enough to act on but open enough for creative exploration
- Suggest the format implicitly (article, video, series, etc.)`,

  product: `You are a product strategist at a top tech company. Transform raw brainstorming context into a clear product opportunity statement.

Rules:
- Output ONLY the product opportunity statement, nothing else
- Frame it as a user need paired with a solution direction
- Keep it to 1-2 sentences maximum
- Make it specific about who benefits and what changes for them
- Focus on the value proposition, not the implementation`,

  social: `You are a social media strategist known for viral campaigns. Transform raw brainstorming context into a social-first content concept.

Rules:
- Output ONLY the social concept, nothing else
- Frame it as a shareable, platform-native idea
- Keep it to 1-2 sentences maximum
- Make it punchy, culturally relevant, and scroll-stopping
- Hint at the format (reel, thread, meme, challenge, etc.)`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, focusType } = await req.json();

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

    const systemPrompt = focusTypePrompts[focusType] || focusTypePrompts['hmw'];

    console.log('Refining problem statement for context:', context.substring(0, 100), 'focusType:', focusType || 'hmw');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Transform this brainstorming context into a refined statement:\n\n${context}`
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
