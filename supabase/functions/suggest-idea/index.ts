import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const focusTypeInstructions: Record<string, string> = {
  hmw: 'suggest ONE compelling product/service/campaign idea that combines all of them',
  campaign: 'suggest ONE bold campaign concept that combines all of them into a unified marketing direction',
  content: 'suggest ONE compelling content piece (article, video, series) that combines all of them',
  product: 'suggest ONE product or feature idea that combines all of them into a tangible user experience',
  social: 'suggest ONE viral social media post concept that combines all of them into a shareable moment',
  open: 'suggest ONE creative idea that combines all of them in an unexpected way',
};

const focusTypeOutputHints: Record<string, { titleHint: string; descHint: string }> = {
  hmw: { titleHint: 'A catchy name for the idea (max 6 words)', descHint: 'A 2-3 sentence pitch explaining the concept' },
  campaign: { titleHint: 'A campaign name (max 6 words)', descHint: 'A 2-3 sentence campaign brief' },
  content: { titleHint: 'A headline or title (max 6 words)', descHint: 'A 2-3 sentence content synopsis' },
  product: { titleHint: 'A product/feature name (max 6 words)', descHint: 'A 2-3 sentence product pitch' },
  social: { titleHint: 'A post hook or concept name (max 6 words)', descHint: 'A 2-3 sentence post concept description' },
  open: { titleHint: 'A catchy name for the idea (max 6 words)', descHint: 'A 2-3 sentence description of the idea' },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { cards, problemStatement, focusType, language } = body;
    
    if (!cards || typeof cards !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requiredFields = ['insight', 'asset', 'tech', 'random'] as const;
    const maxCardLength = 500;

    for (const field of requiredFields) {
      if (!cards[field] || typeof cards[field] !== 'string') {
        return new Response(
          JSON.stringify({ error: `Missing or invalid field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (cards[field].length > maxCardLength) {
        return new Response(
          JSON.stringify({ error: `Field ${field} exceeds maximum length of ${maxCardLength}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (problemStatement && (typeof problemStatement !== 'string' || problemStatement.length > 1000)) {
      return new Response(
        JSON.stringify({ error: 'Invalid problem statement (max 1000 characters)' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { insight, asset, tech, random } = cards;

    const ft = focusType || 'hmw';
    const instruction = focusTypeInstructions[ft] || focusTypeInstructions['hmw'];
    const hints = focusTypeOutputHints[ft] || focusTypeOutputHints['hmw'];

    const focusContext = problemStatement 
      ? `\n\nIMPORTANT SESSION FOCUS: "${problemStatement}"\nYour idea MUST directly address this focus/problem statement. Make sure the suggested concept is relevant and applicable to this specific challenge.\n`
      : '';

    const prompt = `You are a creative innovation consultant. Given these four elements, ${instruction}.${focusContext}

Consumer Insight: "${insight}"
Existing Asset: "${asset}"
New Technology: "${tech}"
Creative Twist: "${random}"

Respond with a JSON object containing:
- title: ${hints.titleHint}
- description: ${hints.descHint}${problemStatement ? ' that addresses the session focus' : ''}

Be creative, practical, and exciting. Focus on how these elements work together synergistically.`;

    const isZhHK = language === 'zh-HK';
    const langInstruction = isZhHK
      ? `Respond in Hong Kong Traditional Chinese (繁體中文 · 香港) using Apple's product copy style: confident, minimal, written register (書面語, not 口語). Use 的/是/這, never 嘅/係/呢. Short declarative sentences. No exclamation marks. Keep these English terms verbatim: HMW, Campaign Brief, AI, Wildcard. Output the JSON keys "title" and "description" with values in Traditional Chinese.`
      : 'Respond in English.';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: langInstruction },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    let suggestion;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestion = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      suggestion = {
        title: "AI Generated Idea",
        description: content.slice(0, 200),
      };
    }

    return new Response(JSON.stringify(suggestion), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("suggest-idea error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
