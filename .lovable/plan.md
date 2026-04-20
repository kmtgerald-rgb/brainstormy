
## Add EN ⇄ 繁 (zh-HK) language switching — Apple-style HK Chinese

Same architecture as the previous plan, with two refinements based on user feedback.

### Refinements

**1. Keep professional jargon in English**
These terms stay in English even in zh-HK mode:
- `HMW` / `How Might We` (no 「我哋可以點樣」 translation)
- `Campaign Brief`, `Content Strategy`, `Product Opportunity`, `Social-First`
- `Freejam`, `Time Attack`, `Target` (game mode names)
- `AI`, `Wildcard`, `Mash-Up`, `Reshuffle`
- Category names stay bilingual: `Insight 洞察`, `Asset 資產`, `Catalyst 催化劑`, `Random 隨機` — short EN label kept, Chinese added as supporting text only where space allows; in compact UI keep EN only.

Implementation: in `zh-HK.json`, these keys hold the English term verbatim. Translators don't touch them.

**2. Apple-style tonality for zh-HK**
Reference: Apple HK product copy — short, confident, declarative, generous spacing in phrasing, avoids exclamation marks and casual particles (冇/喇/㗎). Uses 你 (not 您), present tense, sentence fragments over full sentences.

Examples:
| English | Old (workshop tone) | New (Apple tone) |
|---|---|---|
| Draw the unexpected. | 抽出意想不到嘅一張。 | 抽一張，意想不到。 |
| Four forces. One idea. | 四股力量，一個諗法。 | 四種力量。一個構想。 |
| Browse Decks | 瀏覽牌組 | 瀏覽牌庫 |
| Name this combination | 為呢個組合改名 | 為這個組合命名 |
| How do these forces connect? | 呢四張卡點樣連繫？ | 這些力量如何連結？ |
| Shuffle the deck | 洗牌 | 洗牌 |
| Reshuffle | 再洗 | 重新洗牌 |
| Capture | 儲存 | 儲存構想 |
| AI Sparks | AI 火花 | AI 靈感 |
| Your Ideas | 你嘅諗法 | 你的構想 |

Style rules baked into translation:
- Use 的 not 嘅, 是 not 係, 這 not 呢, 和 not 同 (written register, not spoken Cantonese)
- Verb-noun fragments over full sentences
- No exclamation marks
- No emoji-equivalent particles (喇/㗎/啦)
- Numbers in Arabic, not 一二三

AI prompt update for `zh-HK`:
> "Respond in Hong Kong Traditional Chinese (繁體中文 · 香港) using Apple's product copy style: confident, minimal, written register (書面語, not 口語). Use 的/是/這, never 嘅/係/呢. Short declarative sentences. No exclamation marks. Keep these English terms verbatim: HMW, Campaign Brief, AI, Wildcard."

### Everything else unchanged from prior plan
- `i18next` + `react-i18next`, `localStorage["language"]`, fallback `en`
- `LanguageToggle.tsx` in `Header.tsx` showing `EN | 繁`
- `src/i18n/locales/{en,zh-HK}.json` with ~250 UI keys
- `src/i18n/cardTranslations.ts` keyed by card id (~120 default cards translated)
- `getCardText(card, lang)` in `defaultCards.ts` — defaults translated, wildcards/AI/overrides verbatim
- All 5 edge functions accept `language`, prepend the Apple-tone system instruction when `zh-HK`
- Client hooks send `i18next.language` in request body

### Out of scope
- Retranslating existing AI cards / saved ideas (stay in original language)
- Simplified Chinese (architecture supports adding later)
