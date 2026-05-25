export function removeHarakat(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
    .replace(/\u0640/g, '');
}

export function normalizeArabic(text: string): string {
  return removeHarakat(text)
    .replace(/[أإآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function countWords(lines: string[]): number {
  return lines.join(' ').split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200);
  if (minutes < 1) return 'أقل من دقيقة';
  if (minutes === 1) return 'دقيقة واحدة';
  if (minutes === 2) return 'دقيقتان';
  if (minutes <= 10) return `${minutes} دقائق`;
  return `${minutes} دقيقة`;
}

export function highlightMatches(text: string, query: string): (string | { match: string })[] {
  if (!query || query.length < 2) return [text];
  const normalQ = normalizeArabic(query);
  const parts: (string | { match: string })[] = [];
  let remaining = text;
  let i = 0;
  while (i < remaining.length) {
    const slice = remaining.slice(i);
    const normalSlice = normalizeArabic(slice.slice(0, normalQ.length + 10));
    const idx = normalizeArabic(slice).indexOf(normalQ);
    if (idx === -1) {
      parts.push(remaining.slice(i));
      break;
    }
    if (idx > 0) parts.push(slice.slice(0, idx));
    parts.push({ match: slice.slice(idx, idx + query.length) });
    i += idx + query.length;
  }
  return parts;
}
