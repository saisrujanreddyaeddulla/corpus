import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateWorkspace } from "@/lib/workspace";
import { checkQueryLimit, incrementQueryUsage } from "@/lib/usage";
import { embedText } from "@/lib/embeddings";
import { streamGroundedAnswer, SourceChunk } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, conversationId } = await req.json();
  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  const workspace = await getOrCreateWorkspace();
  const usage = await checkQueryLimit(workspace.id, workspace.plan);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: `Monthly question limit reached (${usage.used}/${usage.limit} on the ${workspace.plan} plan). Upgrade for more.` },
      { status: 403 }
    );
  }

  const db = supabaseAdmin();
  const queryEmbedding = await embedText(question, "query");

  const { data: matches, error: matchError } = await db.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_workspace_id: workspace.id,
    match_count: 6,
  });
  if (matchError) {
    return NextResponse.json({ error: "Retrieval failed" }, { status: 500 });
  }

  if (!matches || matches.length === 0) {
    return NextResponse.json(
      { error: "No documents found to search. Upload a document first." },
      { status: 422 }
    );
  }

  const documentIds: string[] = Array.from(new Set(matches.map((m: any) => m.document_id)));
  const { data: docs } = await db.from("documents").select("id, name").in("id", documentIds);
  const docNameById = new Map((docs ?? []).map((d) => [d.id, d.name]));

  const sources: SourceChunk[] = matches.map((m: any) => ({
    id: m.id,
    documentName: docNameById.get(m.document_id) ?? "Unknown document",
    pageNumber: m.page_number,
    content: m.content,
  }));

  await incrementQueryUsage(workspace.id);

  let convoId = conversationId;
  if (!convoId) {
    const { data: convo } = await db
      .from("conversations")
      .insert({ workspace_id: workspace.id, clerk_user_id: userId, title: question.slice(0, 60) })
      .select()
      .single();
    convoId = convo?.id;
  }
  await db.from("messages").insert({ conversation_id: convoId, role: "user", content: question });

  const citations = sources.map((s, i) => ({
    index: i + 1,
    documentName: s.documentName,
    pageNumber: s.pageNumber,
    snippet: s.content.slice(0, 240),
  }));

  const stream = streamGroundedAnswer(question, sources);

  const [clientStream, storageStream] = stream.tee();
  (async () => {
    try {
      const reader = storageStream.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
      }
      await db.from("messages").insert({
        conversation_id: convoId,
        role: "assistant",
        content: full,
        citations,
      });
    } catch (err) {
      console.error("Failed to persist assistant message:", err);
    }
  })();

  return new NextResponse(clientStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": convoId,
      "X-Citations": encodeURIComponent(JSON.stringify(citations)),
    },
  });
}
