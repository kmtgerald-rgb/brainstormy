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
    const { type, context, language } = await req.json();

    if (!type || !context) {
      return new Response(
        JSON.stringify({ error: 'Missing type or context' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'industry') {
      systemPrompt = `You are a strategic insight generator for creative brainstorming sessions. Generate consumer insights specific to a given industry. Each insight should be:
- A concise observation about consumer behavior, needs, or tensions in that industry
- Written as a statement (not a question)
- Actionable and thought-provoking for ideation
- Between 4-12 words`;

      userPrompt = `Generate exactly 20 unique consumer insights for the ${context} industry. 

Format: Return ONLY a JSON array of 20 strings, nothing else. Example:
["Patients want control over their health data", "Trust in institutions is declining", ...]`;
    } else if (type === 'region') {
      systemPrompt = `You are a cultural insight generator for creative brainstorming sessions. Generate consumer insights specific to a given country or region. Each insight should be:
- A concise observation about cultural values, behaviors, or consumer patterns in that region
- Written as a statement (not a question)
- Actionable and thought-provoking for ideation
- Between 4-12 words`;

      userPrompt = `Generate exactly 20 unique consumer insights for ${context}. Focus on cultural behaviors, values, and consumer patterns specific to this region.

Format: Return ONLY a JSON array of 20 strings, nothing else. Example:
["Group harmony outweighs individual expression", "Cash is still king for many transactions", ...]`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be "industry" or "region"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isZhHK = language === 'zh-HK';
    if (isZhHK) {
      systemPrompt += `\n\nRespond in Hong Kong Traditional Chinese (繁體中文 · 香港) using Apple's product copy style: confident, minimal, written register (書面語, not 口語). Use 的/是/這, never 嘅/係/呢. Short declarative phrases. No exclamation marks. Keep these English terms verbatim: HMW, Campaign Brief, AI, Wildcard.`;
      userPrompt += `\n\nIMPORTANT: All 20 strings in the JSON array MUST be in Traditional Chinese (繁體中文 · 香港) using Apple-style 書面語. Use 的/是/這, never 嘅/係/呢.`;
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Generating ${type} deck for: ${context}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    console.log('Raw AI response:', content);

    // Parse the JSON array from the response
    let cards: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cards = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: split by newlines and clean up
      cards = content
        .split('\n')
        .map((line: string) => line.replace(/^[\d\.\-\*]+\s*/, '').trim())
        .filter((line: string) => line.length > 0 && line.length < 100)
        .slice(0, 20);
    }

    // Ensure we have exactly 20 cards
    if (cards.length < 20) {
      console.warn(`Only generated ${cards.length} cards`);
    }

    console.log(`Generated ${cards.length} cards for ${type}: ${context}`);

    return new Response(
      JSON.stringify({ cards: cards.slice(0, 20) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in generate-deck function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
