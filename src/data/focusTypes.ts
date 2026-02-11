export type FocusType = 'hmw' | 'campaign' | 'content' | 'product' | 'social' | 'open';

export interface FocusTypeConfig {
  type: FocusType;
  label: string;
  description: string;
  aiPrompt: string | null;
  ideaPlaceholder: string;
  descriptionPlaceholder: string;
  refineLabel: string;
}

export const FOCUS_TYPES: FocusTypeConfig[] = [
  {
    type: 'hmw',
    label: 'How Might We',
    description: 'Classic problem framing for innovation',
    aiPrompt: `You are a strategic innovation consultant. Transform raw brainstorming context into a clear, actionable problem statement.

Rules:
- Output ONLY the problem statement, nothing else
- Use "How Might We" format
- Keep it to 1-2 sentences maximum
- Make it inspiring and open-ended to encourage creative thinking
- Include a measurable goal or target if one is provided
- Be concise but capture the essence of the challenge`,
    ideaPlaceholder: 'Name this combination...',
    descriptionPlaceholder: 'How do these forces connect?',
    refineLabel: 'Refine as HMW',
  },
  {
    type: 'campaign',
    label: 'Campaign Brief',
    description: 'Marketing campaign direction',
    aiPrompt: `You are a senior creative director at a top agency. Transform raw brainstorming context into a sharp campaign brief direction.

Rules:
- Output ONLY the campaign direction statement, nothing else
- Frame it as a campaign objective with a target audience and desired outcome
- Keep it to 1-2 sentences maximum
- Make it bold, distinctive, and actionable
- Focus on the strategic tension or cultural insight that drives the campaign`,
    ideaPlaceholder: 'Name this campaign...',
    descriptionPlaceholder: 'What\'s the big idea behind this campaign?',
    refineLabel: 'Refine as Campaign Brief',
  },
  {
    type: 'content',
    label: 'Content Idea',
    description: 'Editorial or content concept',
    aiPrompt: `You are a content strategist at a leading media company. Transform raw brainstorming context into a compelling content concept.

Rules:
- Output ONLY the content concept, nothing else
- Frame it as a content piece with a clear angle and audience
- Keep it to 1-2 sentences maximum
- Make it specific enough to act on but open enough for creative exploration
- Suggest the format implicitly (article, video, series, etc.)`,
    ideaPlaceholder: 'Name this content piece...',
    descriptionPlaceholder: 'What angle makes this content compelling?',
    refineLabel: 'Refine as Content Idea',
  },
  {
    type: 'product',
    label: 'Product / Feature',
    description: 'Product or feature opportunity',
    aiPrompt: `You are a product strategist at a top tech company. Transform raw brainstorming context into a clear product opportunity statement.

Rules:
- Output ONLY the product opportunity statement, nothing else
- Frame it as a user need paired with a solution direction
- Keep it to 1-2 sentences maximum
- Make it specific about who benefits and what changes for them
- Focus on the value proposition, not the implementation`,
    ideaPlaceholder: 'Name this product idea...',
    descriptionPlaceholder: 'What problem does this solve and for whom?',
    refineLabel: 'Refine as Product Idea',
  },
  {
    type: 'social',
    label: 'Social Post',
    description: 'Social-first content concept',
    aiPrompt: `You are a social media strategist known for viral campaigns. Transform raw brainstorming context into a social-first content concept.

Rules:
- Output ONLY the social concept, nothing else
- Frame it as a shareable, platform-native idea
- Keep it to 1-2 sentences maximum
- Make it punchy, culturally relevant, and scroll-stopping
- Hint at the format (reel, thread, meme, challenge, etc.)`,
    ideaPlaceholder: 'Name this post concept...',
    descriptionPlaceholder: 'What makes this shareable?',
    refineLabel: 'Refine as Social Post',
  },
  {
    type: 'open',
    label: 'Open / Freeform',
    description: 'No AI reframing — write freely',
    aiPrompt: null,
    ideaPlaceholder: 'Name this idea...',
    descriptionPlaceholder: 'Describe the idea in your own words...',
    refineLabel: '',
  },
];

export function getFocusTypeConfig(type: FocusType): FocusTypeConfig {
  return FOCUS_TYPES.find((ft) => ft.type === type) ?? FOCUS_TYPES[0];
}
