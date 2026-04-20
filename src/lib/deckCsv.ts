import { Card, Category } from '@/data/defaultCards';

export const VALID_CATEGORIES: Category[] = ['insight', 'asset', 'tech', 'random'];

export type CsvCardType = 'default' | 'custom' | 'ai';

export interface ParsedCsvRow {
  category: Category;
  text: string;
  type: CsvCardType;
}

export interface ParseResult {
  rows: ParsedCsvRow[];
  skipped: number;
  errors: string[];
}

const cardType = (card: Card): CsvCardType => {
  if (card.isGenerated) return 'ai';
  if (card.isWildcard) return 'custom';
  return 'default';
};

// RFC 4180 quoting
export const escapeField = (value: string): string => {
  const needsQuoting = /[",\r\n\t]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
};

/**
 * Serialize a list of single-column text values as TSV (one per line),
 * RFC-4180 quoting any value containing tabs, quotes, or newlines so multi-line
 * cells round-trip cleanly through Excel/Sheets.
 */
export function serializeTextLinesToTsv(texts: string[]): string {
  return texts.map(escapeField).join('\r\n');
}

/**
 * Parse pasted clipboard text (TSV or plain lines) into a flat list of strings.
 * - Splits on row terminators (CRLF/LF) respecting RFC-4180 quoted fields
 *   (so multi-line quoted cells stay together).
 * - If rows have multiple tab-separated columns, only the FIRST column is kept.
 * - Empty trailing/blank lines are dropped.
 * Returns { lines, hadMultipleColumns } so the caller can hint the user.
 */
export function parsePastedTextToLines(text: string): {
  lines: string[];
  hadMultipleColumns: boolean;
} {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === '\t') {
      current.push(field);
      field = '';
      i++;
      continue;
    }
    if (char === '\r') {
      i++;
      continue;
    }
    if (char === '\n') {
      current.push(field);
      rows.push(current);
      current = [];
      field = '';
      i++;
      continue;
    }
    field += char;
    i++;
  }
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  let hadMultipleColumns = false;
  const lines: string[] = [];
  for (const row of rows) {
    if (row.length > 1) hadMultipleColumns = true;
    const first = (row[0] ?? '').trim();
    if (first.length > 0) lines.push(first);
  }
  return { lines, hadMultipleColumns };
}

export function serializeDeckToCsv(cards: Card[]): string {
  const header = 'category,text,type';
  const rows = cards.map((card) =>
    [escapeField(card.category), escapeField(card.text), escapeField(cardType(card))].join(','),
  );
  return [header, ...rows].join('\r\n');
}

// RFC 4180 parser — handles quoted fields, escaped quotes, CRLF/LF
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (char === ',') {
      current.push(field);
      field = '';
      i++;
      continue;
    }

    if (char === '\r') {
      // skip; \n will close the row
      i++;
      continue;
    }

    if (char === '\n') {
      current.push(field);
      rows.push(current);
      current = [];
      field = '';
      i++;
      continue;
    }

    field += char;
    i++;
  }

  // trailing field/row
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows;
}

export function parseCsvToCards(text: string): ParseResult {
  const result: ParseResult = { rows: [], skipped: 0, errors: [] };
  const allRows = parseCsv(text).filter((r) => r.some((f) => f.trim().length > 0));

  if (allRows.length === 0) return result;

  // Detect header
  const first = allRows[0].map((f) => f.trim().toLowerCase());
  const hasHeader = first.includes('category') && first.includes('text');
  const dataRows = hasHeader ? allRows.slice(1) : allRows;

  // Column indices (default to 0,1,2)
  let catIdx = 0;
  let textIdx = 1;
  let typeIdx = 2;

  if (hasHeader) {
    catIdx = first.indexOf('category');
    textIdx = first.indexOf('text');
    const ti = first.indexOf('type');
    typeIdx = ti >= 0 ? ti : -1;
  }

  for (const row of dataRows) {
    const rawCat = (row[catIdx] ?? '').trim().toLowerCase();
    const rawText = (row[textIdx] ?? '').trim();
    const rawType = typeIdx >= 0 ? ((row[typeIdx] ?? '').trim().toLowerCase() as CsvCardType) : 'custom';

    if (!VALID_CATEGORIES.includes(rawCat as Category)) {
      result.skipped++;
      continue;
    }
    if (!rawText) {
      result.skipped++;
      continue;
    }

    result.rows.push({
      category: rawCat as Category,
      text: rawText,
      type: (['default', 'custom', 'ai'] as CsvCardType[]).includes(rawType) ? rawType : 'custom',
    });
  }

  return result;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function csvFilename(presetName: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const slug = presetName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'deck';
  return `mashup-deck-${slug}-${date}.csv`;
}

export const LLM_DECK_PROMPT = `Generate a brainstorming card deck for [TOPIC] as CSV with this exact schema:

category,text,type

Rules:
- category must be one of: insight, asset, tech, random
  - insight = consumer/human/cultural truths
  - asset = brand assets, channels, owned things
  - tech = catalysts: technologies, formats, platforms
  - random = wild, unrelated provocations
- text = a single short, punchy card (8–18 words). No numbering, no quotes inside unless escaped.
- type = always "custom" for generated rows.

Generate exactly 15 cards per category (60 total). Output ONLY the CSV — no preamble, no code fence, no commentary. First line must be the header.`;
