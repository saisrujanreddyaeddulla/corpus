import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateWorkspace } from "@/lib/workspace";

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getOrCreateWorkspace();
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("documents")
    .select("id, name, status, page_count, created_at")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  return NextResponse.json(data);
}
