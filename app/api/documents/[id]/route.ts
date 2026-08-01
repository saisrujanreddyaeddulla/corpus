import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateWorkspace } from "@/lib/workspace";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getOrCreateWorkspace();
  const db = supabaseAdmin();

  const { data: doc } = await db
    .from("documents")
    .select("*")
    .eq("id", params.id)
    .eq("workspace_id", workspace.id) // scoped so users can only delete their own workspace's docs
    .maybeSingle();

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.storage.from("documents").remove([doc.storage_path]);
  await db.from("documents").delete().eq("id", doc.id); // cascades to chunks

  return NextResponse.json({ ok: true });
}
