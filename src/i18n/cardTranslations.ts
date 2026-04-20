import type { Card } from '@/data/defaultCards';
import type { SupportedLanguage } from './index';

/**
 * Translations for default cards by id.
 * Apple-style HK Traditional Chinese: 書面語, short, declarative.
 * Wildcards, AI-generated, and overridden cards are NOT translated here —
 * they show whatever text the user/AI authored.
 */
export const cardTranslations: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  // Consumer Insights
  i1: { 'zh-HK': '人們渴望真實,而非完美' },
  i2: { 'zh-HK': '抉擇疲勞是真實的' },
  i3: { 'zh-HK': 'FOMO 驅動衝動行為' },
  i4: { 'zh-HK': '懷舊有市場' },
  i5: { 'zh-HK': '人們想成為圈內人' },
  i6: { 'zh-HK': '便利勝過品質' },
  i7: { 'zh-HK': '社會認同影響決定' },
  i8: { 'zh-HK': '人們討厭等待' },
  i9: { 'zh-HK': '個人化讓人感受到關懷' },
  i10: { 'zh-HK': '可見的可持續性才有價值' },
  i11: { 'zh-HK': '人們想掌控自己的數據' },
  i12: { 'zh-HK': '多工已是新常態' },
  i13: { 'zh-HK': '透明度建立信任' },
  i14: { 'zh-HK': '人們買的是故事,不是產品' },
  i15: { 'zh-HK': '意外的獎賞,感覺更好' },
  i16: { 'zh-HK': '社群創造忠誠' },
  i17: { 'zh-HK': '簡潔勝過功能多' },
  i18: { 'zh-HK': '失去的恐懼大於得到的喜悅' },
  i19: { 'zh-HK': '習慣難改' },
  i20: { 'zh-HK': '情感觸發行動' },

  // Existing Assets
  a1: { 'zh-HK': '客戶資料庫' },
  a2: { 'zh-HK': '品牌知名度' },
  a3: { 'zh-HK': '分銷網絡' },
  a4: { 'zh-HK': '實體店面' },
  a5: { 'zh-HK': '忠實社群' },
  a6: { 'zh-HK': '專屬數據' },
  a7: { 'zh-HK': '生產能力' },
  a8: { 'zh-HK': '內容資料庫' },
  a9: { 'zh-HK': '合作夥伴網絡' },
  a10: { 'zh-HK': '技術基礎建設' },
  a11: { 'zh-HK': '訓練有素的團隊' },
  a12: { 'zh-HK': '知識產權' },
  a13: { 'zh-HK': '已有用戶的手機應用' },
  a14: { 'zh-HK': '社交媒體追蹤者' },
  a15: { 'zh-HK': '客戶服務團隊' },
  a16: { 'zh-HK': '研發能力' },
  a17: { 'zh-HK': '供應鏈關係' },
  a18: { 'zh-HK': '活動或體驗場地' },
  a19: { 'zh-HK': '電郵訂閱名單' },
  a20: { 'zh-HK': '品牌歷史檔案' },

  // New Technology
  t1: { 'zh-HK': '生成式 AI' },
  t2: { 'zh-HK': '語音助理' },
  t3: { 'zh-HK': '擴增實境 (AR)' },
  t4: { 'zh-HK': '區塊鏈 / Web3' },
  t5: { 'zh-HK': '電腦視覺' },
  t6: { 'zh-HK': '物聯網感測器' },
  t7: { 'zh-HK': '即時翻譯' },
  t8: { 'zh-HK': '預測分析' },
  t9: { 'zh-HK': '生物特徵驗證' },
  t10: { 'zh-HK': '空間運算' },
  t11: { 'zh-HK': '邊緣運算' },
  t12: { 'zh-HK': '數位分身' },
  t13: { 'zh-HK': '5G 連接' },
  t14: { 'zh-HK': '機械人 / 自動化' },
  t15: { 'zh-HK': '神經介面' },
  t16: { 'zh-HK': '合成媒體' },
  t17: { 'zh-HK': '量子運算' },
  t18: { 'zh-HK': '自動駕駛' },
  t19: { 'zh-HK': '3D 列印' },
  t20: { 'zh-HK': '穿戴式裝置' },

  // Random / Misc
  r1: { 'zh-HK': '把它變成遊戲' },
  r2: { 'zh-HK': '加入社交層次' },
  r3: { 'zh-HK': '反轉流程' },
  r4: { 'zh-HK': '加入時間壓力' },
  r5: { 'zh-HK': '把它實體化' },
  r6: { 'zh-HK': '加入稀缺感' },
  r7: { 'zh-HK': '改為訂閱制' },
  r8: { 'zh-HK': '建立儀式感' },
  r9: { 'zh-HK': '針對小朋友' },
  r10: { 'zh-HK': '把它變得隱形' },
  r11: { 'zh-HK': '找一個意想不到的合作夥伴' },
  r12: { 'zh-HK': '善用聲音與音樂' },
  r13: { 'zh-HK': '令它易於分享' },
  r14: { 'zh-HK': '走超本地化' },
  r15: { 'zh-HK': '加入機率元素' },
  r16: { 'zh-HK': '建立等候名單' },
  r17: { 'zh-HK': '與其他事物綑綁' },
  r18: { 'zh-HK': '加入季節限定' },
  r19: { 'zh-HK': '加入吉祥物' },
  r20: { 'zh-HK': '反轉商業模式' },

  // Content Format
  cf1: { 'zh-HK': '短片(60 秒內)' },
  cf2: { 'zh-HK': '長篇紀錄片' },
  cf3: { 'zh-HK': '互動測驗' },
  cf4: { 'zh-HK': 'Podcast 節目' },
  cf5: { 'zh-HK': '資訊圖表' },
  cf6: { 'zh-HK': 'Meme / 病毒圖片' },
  cf7: { 'zh-HK': '幕後花絮' },
  cf8: { 'zh-HK': '用戶生成內容' },
  cf9: { 'zh-HK': '直播' },
  cf10: { 'zh-HK': '教學 / 操作指南' },
  cf11: { 'zh-HK': '見證 / 個案研究' },
  cf12: { 'zh-HK': '數據視覺化' },
  cf13: { 'zh-HK': '互動計算機' },
  cf14: { 'zh-HK': '電郵通訊' },
  cf15: { 'zh-HK': '白皮書 / 報告' },
  cf16: { 'zh-HK': '輪播貼文' },
  cf17: { 'zh-HK': 'AR 濾鏡' },
  cf18: { 'zh-HK': '聲音片段' },
  cf19: { 'zh-HK': 'Thread / 系列故事' },
  cf20: { 'zh-HK': '互動體驗' },

  // Channel
  ch1: { 'zh-HK': 'TikTok' },
  ch2: { 'zh-HK': 'Instagram Reels' },
  ch3: { 'zh-HK': 'YouTube' },
  ch4: { 'zh-HK': 'LinkedIn' },
  ch5: { 'zh-HK': '電郵營銷' },
  ch6: { 'zh-HK': 'Podcast 廣告' },
  ch7: { 'zh-HK': 'KOL 合作' },
  ch8: { 'zh-HK': '戶外廣告' },
  ch9: { 'zh-HK': '智能電視 / 串流' },
  ch10: { 'zh-HK': '應用內廣告' },
  ch11: { 'zh-HK': 'SMS / 通訊應用' },
  ch12: { 'zh-HK': 'Reddit / 討論區' },
  ch13: { 'zh-HK': 'Discord 社群' },
  ch14: { 'zh-HK': 'Pinterest' },
  ch15: { 'zh-HK': 'Spotify / 音樂串流' },
  ch16: { 'zh-HK': '電競 / 遊戲' },
  ch17: { 'zh-HK': '零售媒體網絡' },
  ch18: { 'zh-HK': 'WhatsApp / Telegram' },
  ch19: { 'zh-HK': 'Threads / X (Twitter)' },
  ch20: { 'zh-HK': '原生內容合作' },
};

/**
 * Returns the localized text for a card.
 * - Default cards with translations: returns translation.
 * - Wildcards / AI-generated / overridden / unknown: returns the original text verbatim.
 */
export function getCardText(card: Card, language: string): string {
  if (!card) return '';
  if (card.isWildcard || card.isGenerated) return card.text;
  const lang = language as SupportedLanguage;
  const entry = cardTranslations[card.id];
  return entry?.[lang] ?? card.text;
}
