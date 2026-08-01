import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateWorkspace } from "@/lib/workspace";
import { checkDocumentLimit } from "@/lib/usage";
import { extractPages } from "@/lib/extract";
import { chunkPage } from "@/lib/chunk";
import { embedTexts } from "@/lib/embeddings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getOrCreateWorkspace();
  const limit = await checkDocumentLimit(workspace.id, workspace.plan);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Document limit reached (${limit.used}/${limit.limit} on the ${workspace.plan} plan). Upgrade to add more.` },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const db = supabaseAdmin();

  const storagePath = `${workspace.id}/${Date.now()}-${file.name}`;
  const { error: storageError } = await db.storage.from("documents").upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
  });
  if (storageError) {
    return NextResponse.json({ error: `Storage upload failed: ${storageError.message}` }, { status: 500 });
  }

  const { data: document, error: docError } = await db
    .from("documents")
    .insert({ workspace_id: workspace.id, name: file.name, storage_path: storagePath, status: "processing" })
    .select()
    .single();
  if (docError || !document) {
    return NextResponse.json({ error: "Failed to create document record" }, { status: 500 });
  }

  // Process synchronously for simplicity. For large files or high traffic,
  // move this block to a background job (e.g. a queue or Vercel background
  // function) so the upload request returns immediately.
  try {
    const pages = await extractPages(buffer, file.name);
    const allChunks = pages.flatMap((p) => chunkPage(p.text, p.pageNumber));

    if (allChunks.length === 0) {
      await db.from("documents").update({ status: "error" }).eq("id", document.id);
      return NextResponse.json({ error: "No extractable text found in this file" }, { status: 422 });
    }

    const BATCH = 32;
    for (let i = 0; i < allChunks.length; i += BATCH) {
      const batch = allChunks.slice(i, i + BATCH);
      const embeddings = await embedTexts(batch.map((c) => c.content), "document");
      await db.from("chunks").insert(
        batch.map((c, j) => ({
          document_id: document.id,
          workspace_id: workspace.id,
          content: c.content,
          page_number: c.pageNumber,
          chunk_index: i + j,
          embedding: embeddings[j],
        }))
      );
    }

    await db
      .from("documents")
      .update({ status: "ready", page_count: pages.length })
      .eq("id", document.id);

    return NextResponse.json({ document: { ...document, status: "ready" } });
  } catch (err) {
    console.error("Document processing failed", err);
    await db.from("documents").update({ status: "error" }).eq("id", document.id);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
