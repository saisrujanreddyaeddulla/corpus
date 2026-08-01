export type Chunk = { content: string; pageNumber: number | null };

// Splits page text into overlapping chunks along paragraph/sentence
// boundaries where possible, so retrieved context reads naturally rather
// than cutting off mid-sentence.
export function chunkPage(text: string, pageNumber: number | null, size = 900, overlap = 150): Chunk[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks: Chunk[] = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const boundary = clean.lastIndexOf(". ", end);
      if (boundary > start + size * 0.5) end = boundary + 1;
    }
    chunks.push({ content: clean.slice(start, end).trim(), pageNumber });
    if (end >= clean.length) break;
    start = end - overlap;
  }

  return chunks.filter((c) => c.content.length > 0);
}
