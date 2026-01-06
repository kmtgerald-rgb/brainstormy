export type Category = 'insight' | 'asset' | 'tech' | 'random';

export interface Card {
  id: string;
  text: string;
  category: Category;
  isWildcard: boolean;
}

export const categoryLabels: Record<Category, string> = {
  insight: 'Consumer Insight',
  asset: 'Existing Asset',
  tech: 'New Technology',
  random: 'Random / Misc',
};

export const categoryIcons: Record<Category, string> = {
  insight: '◈',
  asset: '◆',
  tech: '⚡',
  random: '◇',
};

// Strategic type mappings - Pokémon-inspired
export const categoryTypes: Record<Category, string> = {
  insight: 'PSYCHIC',
  asset: 'STEEL',
  tech: 'ELECTRIC',
  random: 'GHOST',
};

// Get card index number (e.g., "PSY-001")
export const getCardIndex = (card: Card): string => {
  const prefix = { insight: 'PSY', asset: 'STL', tech: 'ELC', random: 'GHT' }[card.category];
  const num = card.id.replace(/[^0-9]/g, '').padStart(3, '0');
  return `${prefix}-${num}`;
};

export const defaultCards: Card[] = [
  // Consumer Insights (20)
  { id: 'i1', text: 'People crave authenticity over perfection', category: 'insight', isWildcard: false },
  { id: 'i2', text: 'Decision fatigue is real', category: 'insight', isWildcard: false },
  { id: 'i3', text: 'FOMO drives impulsive behavior', category: 'insight', isWildcard: false },
  { id: 'i4', text: 'Nostalgia sells', category: 'insight', isWildcard: false },
  { id: 'i5', text: 'People want to feel like insiders', category: 'insight', isWildcard: false },
  { id: 'i6', text: 'Convenience beats quality', category: 'insight', isWildcard: false },
  { id: 'i7', text: 'Social proof influences decisions', category: 'insight', isWildcard: false },
  { id: 'i8', text: 'People hate waiting', category: 'insight', isWildcard: false },
  { id: 'i9', text: 'Personalization feels like care', category: 'insight', isWildcard: false },
  { id: 'i10', text: 'Sustainability matters (when visible)', category: 'insight', isWildcard: false },
  { id: 'i11', text: 'People want control over their data', category: 'insight', isWildcard: false },
  { id: 'i12', text: 'Multitasking is the new normal', category: 'insight', isWildcard: false },
  { id: 'i13', text: 'Trust is earned through transparency', category: 'insight', isWildcard: false },
  { id: 'i14', text: 'People buy stories, not products', category: 'insight', isWildcard: false },
  { id: 'i15', text: 'Rewards feel better when unexpected', category: 'insight', isWildcard: false },
  { id: 'i16', text: 'Community creates loyalty', category: 'insight', isWildcard: false },
  { id: 'i17', text: 'Simplicity wins over features', category: 'insight', isWildcard: false },
  { id: 'i18', text: 'People fear missing out more than gaining', category: 'insight', isWildcard: false },
  { id: 'i19', text: 'Habits are hard to break', category: 'insight', isWildcard: false },
  { id: 'i20', text: 'Emotional triggers drive action', category: 'insight', isWildcard: false },

  // Existing Assets (20)
  { id: 'a1', text: 'Customer database', category: 'asset', isWildcard: false },
  { id: 'a2', text: 'Brand recognition', category: 'asset', isWildcard: false },
  { id: 'a3', text: 'Distribution network', category: 'asset', isWildcard: false },
  { id: 'a4', text: 'Physical retail presence', category: 'asset', isWildcard: false },
  { id: 'a5', text: 'Loyal community', category: 'asset', isWildcard: false },
  { id: 'a6', text: 'Proprietary data', category: 'asset', isWildcard: false },
  { id: 'a7', text: 'Manufacturing capability', category: 'asset', isWildcard: false },
  { id: 'a8', text: 'Content library', category: 'asset', isWildcard: false },
  { id: 'a9', text: 'Partnership network', category: 'asset', isWildcard: false },
  { id: 'a10', text: 'Technical infrastructure', category: 'asset', isWildcard: false },
  { id: 'a11', text: 'Trained workforce', category: 'asset', isWildcard: false },
  { id: 'a12', text: 'Intellectual property', category: 'asset', isWildcard: false },
  { id: 'a13', text: 'Mobile app with users', category: 'asset', isWildcard: false },
  { id: 'a14', text: 'Social media following', category: 'asset', isWildcard: false },
  { id: 'a15', text: 'Customer service team', category: 'asset', isWildcard: false },
  { id: 'a16', text: 'R&D capabilities', category: 'asset', isWildcard: false },
  { id: 'a17', text: 'Supply chain relationships', category: 'asset', isWildcard: false },
  { id: 'a18', text: 'Event/experience venues', category: 'asset', isWildcard: false },
  { id: 'a19', text: 'Email subscriber list', category: 'asset', isWildcard: false },
  { id: 'a20', text: 'Historical brand archives', category: 'asset', isWildcard: false },

  // New Technology (20)
  { id: 't1', text: 'Generative AI', category: 'tech', isWildcard: false },
  { id: 't2', text: 'Voice assistants', category: 'tech', isWildcard: false },
  { id: 't3', text: 'Augmented reality', category: 'tech', isWildcard: false },
  { id: 't4', text: 'Blockchain / Web3', category: 'tech', isWildcard: false },
  { id: 't5', text: 'Computer vision', category: 'tech', isWildcard: false },
  { id: 't6', text: 'IoT sensors', category: 'tech', isWildcard: false },
  { id: 't7', text: 'Real-time translation', category: 'tech', isWildcard: false },
  { id: 't8', text: 'Predictive analytics', category: 'tech', isWildcard: false },
  { id: 't9', text: 'Biometric authentication', category: 'tech', isWildcard: false },
  { id: 't10', text: 'Spatial computing', category: 'tech', isWildcard: false },
  { id: 't11', text: 'Edge computing', category: 'tech', isWildcard: false },
  { id: 't12', text: 'Digital twins', category: 'tech', isWildcard: false },
  { id: 't13', text: '5G connectivity', category: 'tech', isWildcard: false },
  { id: 't14', text: 'Robotics / automation', category: 'tech', isWildcard: false },
  { id: 't15', text: 'Neural interfaces', category: 'tech', isWildcard: false },
  { id: 't16', text: 'Synthetic media', category: 'tech', isWildcard: false },
  { id: 't17', text: 'Quantum computing', category: 'tech', isWildcard: false },
  { id: 't18', text: 'Autonomous vehicles', category: 'tech', isWildcard: false },
  { id: 't19', text: '3D printing', category: 'tech', isWildcard: false },
  { id: 't20', text: 'Wearable devices', category: 'tech', isWildcard: false },

  // Random / Miscellaneous (20)
  { id: 'r1', text: 'Make it a game', category: 'random', isWildcard: false },
  { id: 'r2', text: 'Add a social layer', category: 'random', isWildcard: false },
  { id: 'r3', text: 'Reverse the flow', category: 'random', isWildcard: false },
  { id: 'r4', text: 'Add time pressure', category: 'random', isWildcard: false },
  { id: 'r5', text: 'Make it physical', category: 'random', isWildcard: false },
  { id: 'r6', text: 'Introduce scarcity', category: 'random', isWildcard: false },
  { id: 'r7', text: 'Add a subscription', category: 'random', isWildcard: false },
  { id: 'r8', text: 'Create a ritual', category: 'random', isWildcard: false },
  { id: 'r9', text: 'Target kids', category: 'random', isWildcard: false },
  { id: 'r10', text: 'Make it invisible', category: 'random', isWildcard: false },
  { id: 'r11', text: 'Add an unexpected partner', category: 'random', isWildcard: false },
  { id: 'r12', text: 'Use sound/music', category: 'random', isWildcard: false },
  { id: 'r13', text: 'Make it shareable', category: 'random', isWildcard: false },
  { id: 'r14', text: 'Go hyperlocal', category: 'random', isWildcard: false },
  { id: 'r15', text: 'Add an element of chance', category: 'random', isWildcard: false },
  { id: 'r16', text: 'Create a waiting list', category: 'random', isWildcard: false },
  { id: 'r17', text: 'Bundle with something else', category: 'random', isWildcard: false },
  { id: 'r18', text: 'Make it seasonal', category: 'random', isWildcard: false },
  { id: 'r19', text: 'Add a mascot', category: 'random', isWildcard: false },
  { id: 'r20', text: 'Flip the business model', category: 'random', isWildcard: false },
];
