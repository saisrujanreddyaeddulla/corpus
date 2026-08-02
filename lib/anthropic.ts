import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type SourceChunk = {
  id: string;
  documentName: string;
  pageNumber: number | null;
  content: string;
};

const SYSTEM_PROMPT = `You are Corpus, an assistant that answers questions strictly using the
provided source excerpts from the user's own documents.

Rules:
- Only use information found in the excerpts below. If the excerpts don't
  contain the answer, say so plainly instead of guessing.
- After every claim, cite the source using the format [n], where n matches
  the excerpt number it came from.
- - Be concise and direct. Do not pad the answer with filler.
- Format clearly: keep lines short. If you're covering multiple facts or
  items, put each one on its own line starting with "- " rather than
  writing one long paragraph.`;

function buildContextBlock(sources: SourceChunk[]) {
  return sources
    .map(
      (s, i) =>
        `[${i + 1}] Source: ${s.documentName}${s.pageNumber ? `, page ${s.pageNumber}` : ""}\n${s.content}`
    )
    .join("\n\n---\n\n");
}

// Streams a Claude response grounded in the given source chunks.
// Returns a ReadableStream of UTF-8 text chunks suitable for a Next.js
// streaming API route response.
export function streamGroundedAnswer(question: string, sources: SourceChunk[]) {
  const context = buildContextBlock(sources);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const stream = anthropic.messages.stream({
          model: "claude-sonnet-5",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Source excerpts:\n\n${context}\n\n---\n\nQuestion: ${question}`,
            },
          ],
        });

        stream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await stream.finalMessage();
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
