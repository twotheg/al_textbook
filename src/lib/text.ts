export function splitTextIntoChunks(text: string, chunkSize = 3500): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= chunkSize) return normalized ? [normalized] : [];

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    let end = start + chunkSize;
    if (end >= normalized.length) {
      chunks.push(normalized.slice(start));
      break;
    }
    const lastPeriod = normalized.lastIndexOf(".", end);
    const lastKoreanPeriod = Math.max(
      normalized.lastIndexOf("。", end),
      normalized.lastIndexOf("?", end),
      normalized.lastIndexOf("!", end)
    );
    const splitAt = Math.max(lastPeriod, lastKoreanPeriod);
    if (splitAt > start) {
      end = splitAt + 1;
    }
    chunks.push(normalized.slice(start, end));
    start = end;
  }
  return chunks;
}

export function getRandomItems<T>(arr: T[], count: number): T[] {
  if (arr.length <= count) return arr;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
