import { Card, Category } from './defaultCards';

// Insight deck variants
export type InsightVariant = 'general' | 'industry' | 'region';

// Tech deck variants  
export type TechVariant = 'technology' | 'format' | 'channel';

export interface DeckConfig {
  insight: {
    variant: InsightVariant;
    industryName?: string;
    regionName?: string;
  };
  tech: {
    variant: TechVariant;
  };
}

export const defaultDeckConfig: DeckConfig = {
  insight: { variant: 'general' },
  tech: { variant: 'technology' },
};

export const insightVariantLabels: Record<InsightVariant, string> = {
  general: 'Human Truth',
  industry: 'Industry Insight',
  region: 'Regional Insight',
};

export const catalystVariantLabels: Record<TechVariant, string> = {
  technology: 'New Technology',
  format: 'Content Format',
  channel: 'Channel',
};

// Static cards for Content Format variant
export const contentFormatCards: Card[] = [
  { id: 'cf1', text: 'Short-form video (under 60s)', category: 'tech', isWildcard: false },
  { id: 'cf2', text: 'Long-form documentary', category: 'tech', isWildcard: false },
  { id: 'cf3', text: 'Interactive quiz', category: 'tech', isWildcard: false },
  { id: 'cf4', text: 'Podcast episode', category: 'tech', isWildcard: false },
  { id: 'cf5', text: 'Infographic', category: 'tech', isWildcard: false },
  { id: 'cf6', text: 'Meme / viral image', category: 'tech', isWildcard: false },
  { id: 'cf7', text: 'Behind-the-scenes content', category: 'tech', isWildcard: false },
  { id: 'cf8', text: 'User-generated content', category: 'tech', isWildcard: false },
  { id: 'cf9', text: 'Live stream', category: 'tech', isWildcard: false },
  { id: 'cf10', text: 'Tutorial / how-to guide', category: 'tech', isWildcard: false },
  { id: 'cf11', text: 'Testimonial / case study', category: 'tech', isWildcard: false },
  { id: 'cf12', text: 'Data visualization', category: 'tech', isWildcard: false },
  { id: 'cf13', text: 'Interactive calculator', category: 'tech', isWildcard: false },
  { id: 'cf14', text: 'Email newsletter', category: 'tech', isWildcard: false },
  { id: 'cf15', text: 'Whitepaper / report', category: 'tech', isWildcard: false },
  { id: 'cf16', text: 'Carousel post', category: 'tech', isWildcard: false },
  { id: 'cf17', text: 'AR filter / lens', category: 'tech', isWildcard: false },
  { id: 'cf18', text: 'Audio snippet / soundbite', category: 'tech', isWildcard: false },
  { id: 'cf19', text: 'Thread / story series', category: 'tech', isWildcard: false },
  { id: 'cf20', text: 'Interactive experience', category: 'tech', isWildcard: false },
];

// Static cards for Channel variant
export const channelCards: Card[] = [
  { id: 'ch1', text: 'TikTok', category: 'tech', isWildcard: false },
  { id: 'ch2', text: 'Instagram Reels', category: 'tech', isWildcard: false },
  { id: 'ch3', text: 'YouTube', category: 'tech', isWildcard: false },
  { id: 'ch4', text: 'LinkedIn', category: 'tech', isWildcard: false },
  { id: 'ch5', text: 'Email marketing', category: 'tech', isWildcard: false },
  { id: 'ch6', text: 'Podcast advertising', category: 'tech', isWildcard: false },
  { id: 'ch7', text: 'Influencer partnership', category: 'tech', isWildcard: false },
  { id: 'ch8', text: 'Out-of-home advertising', category: 'tech', isWildcard: false },
  { id: 'ch9', text: 'Connected TV / streaming', category: 'tech', isWildcard: false },
  { id: 'ch10', text: 'In-app advertising', category: 'tech', isWildcard: false },
  { id: 'ch11', text: 'SMS / messaging apps', category: 'tech', isWildcard: false },
  { id: 'ch12', text: 'Reddit / forums', category: 'tech', isWildcard: false },
  { id: 'ch13', text: 'Discord communities', category: 'tech', isWildcard: false },
  { id: 'ch14', text: 'Pinterest', category: 'tech', isWildcard: false },
  { id: 'ch15', text: 'Spotify / audio streaming', category: 'tech', isWildcard: false },
  { id: 'ch16', text: 'Gaming / esports', category: 'tech', isWildcard: false },
  { id: 'ch17', text: 'Retail media network', category: 'tech', isWildcard: false },
  { id: 'ch18', text: 'WhatsApp / Telegram', category: 'tech', isWildcard: false },
  { id: 'ch19', text: 'Threads / X (Twitter)', category: 'tech', isWildcard: false },
  { id: 'ch20', text: 'Native content partnership', category: 'tech', isWildcard: false },
];
