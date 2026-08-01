import mammoth from "mammoth";

export type ExtractedPage = { text: string; pageNumber: number | null };

export async function extractPages(buffer: Buffer, filename: string): Promise<ExtractedPage[]> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    // Dynamic import avoids pdf-parse's debug entry point running on cold start.
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    // pdf-parse doesn't give per-page text out of the box in a simple way,
    // so we split on form-feed characters it inserts between pages as a
    // reasonable approximation; falls back to treating it as one page.
    const rawPages = result.text.split("\f");
    return rawPages.map((text, i) => ({ text, pageNumber: i + 1 }));
  }

  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return [{ text: result.value, pageNumber: null }];
  }

  // .txt, .md, and anything else: treat as plain text
  return [{ text: buffer.toString("utf-8"), pageNumber: null }];
}
