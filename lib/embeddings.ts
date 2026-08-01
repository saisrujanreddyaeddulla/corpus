// Voyage AI embeddings — Anthropic's recommended embedding provider for RAG.
// Docs: https://docs.voyageai.com/reference/embeddings-api

export async function embedTexts(
  texts: string[],
  inputType: "document" | "query"
): Promise<number[][]> {
  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-3",
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Voyage embeddings request failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

export async function embedText(text: string, inputType: "document" | "query") {
  const [embedding] = await embedTexts([text], inputType);
  return embedding;
}
