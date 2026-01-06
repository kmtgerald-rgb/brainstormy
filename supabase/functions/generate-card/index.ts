import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const categoryPrompts: Record<string, string> = {
  insight: "Generate a unique consumer psychology insight - a brief observation about human behavior, decision-making, or motivation that could inspire a creative strategy. Keep it punchy (under 10 words) and strategic.",
  asset: "Generate a unique business asset or organizational capability that companies might leverage for innovation. Keep it brief (under 10 words).",
  tech: "Generate an emerging technology, innovation trend, or technical capability that could enable new experiences. Keep it brief (under 10 words).",
  random: "Generate a creative constraint, twist, or unexpected approach that could spark new thinking in a brainstorm. Keep it brief (under 10 words) and actionable.",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { category, existingCards, problemStatement } = body;

    // Input validation
    const validCategories = ['insight', 'asset', 'tech', 'random'];
    
    if (!category || typeof category !== 'string' || !validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Invalid category. Must be: insight, asset, tech, or random' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(existingCards)) {
      return new Response(
        JSON.stringify({ error: 'existingCards must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (problemStatement && (typeof problemStatement !== 'string' || problemStatement.length > 1000)) {
      return new Response(
        JSON.stringify({ error: 'Invalid problem statement (max 1000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const existingList = existingCards.slice(0, 30).join('\n- ');
    const contextClause = problemStatement 
      ? `Consider this problem context for inspiration: "${problemStatement}"\n\n` 
      : '';

    const systemPrompt = `You are a creative strategist helping with brainstorming. Generate fresh, original ideas that spark creative thinking. Be concise and strategic.`;
    
    const userPrompt = `${contextClause}${categoryPrompts[category]}

IMPORTANT: The text must be DIFFERENT from these existing cards:
- ${existingList || 'None yet'}

Respond with ONLY the card text, nothing else. No quotes, no explanation.`;

    console.log(`Generating ${category} card with ${existingCards.length} existing cards`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      console.error("No content in AI response:", data);
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generated: "${generatedText}"`);

    return new Response(
      JSON.stringify({ text: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-card:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
