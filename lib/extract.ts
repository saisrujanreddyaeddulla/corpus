import mammoth from "mammoth";

export type ExtractedPage = { text: string; pageNumber: number | null };

const OCR_SPACE_MAX_BYTES = 1024 * 1024; // 1MB — OCR.space free tier limit

export async function extractPages(buffer: Buffer, filename: string): Promise<ExtractedPage[]> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    const rawPages = result.text.split("\f");
    const pages = rawPages.map((text, i) => ({ text, pageNumber: i + 1 }));

    const totalChars = pages.reduce((sum, p) => sum + p.text.replace(/\s/g, "").length, 0);
    const avgCharsPerPage = totalChars / Math.max(pages.length, 1);
    if (avgCharsPerPage < 20) {
      return ocrPdf(buffer, filename);
    }
    return pages;
  }

  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return [{ text: result.value, pageNumber: null }];
  }

  return [{ text: buffer.toString("utf-8"), pageNumber: null }];
}

async function ocrPdf(buffer: Buffer, filename: string): Promise<ExtractedPage[]> {
  if (!process.env.OCR_SPACE_API_KEY) {
    throw new Error(
      "This looks like a scanned PDF with no selectable text. OCR isn't configured yet — add OCR_SPACE_API_KEY to enable it."
    );
  }
  if (buffer.length > OCR_SPACE_MAX_BYTES) {
    throw new Error(
      "This scanned PDF is larger than 1MB, which is the limit for OCR on the free tier."
    );
  }

  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  const form = new FormData();
  form.append("apikey", process.env.OCR_SPACE_API_KEY);
  form.append("file", new Blob([arrayBuffer]), filename);
  form.append("filetype", "PDF");
  form.append("OCREngine", "2");
  form.append("isOverlayRequired", "false");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`OCR request failed (${response.status})`);
  }

  const data = await response.json();
  if (data.IsErroredOnProcessing) {
    const message = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(" ") : "Unknown OCR error";
    throw new Error(`OCR failed: ${message}`);
  }

  const results = data.ParsedResults ?? [];
  if (results.length === 0) {
    throw new Error("OCR ran but found no readable text in this file.");
  }

  return results.map((r: { ParsedText?: string }, i: number) => ({
    text: r.ParsedText ?? "",
    pageNumber: i + 1,
  }));
}