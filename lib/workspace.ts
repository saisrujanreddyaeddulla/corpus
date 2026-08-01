import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase";

// Resolves the workspace for the signed-in user (org workspace if they're
// in a Clerk organization, otherwise a personal workspace), creating one on
// first use.
export async function getOrCreateWorkspace() {
  const { userId, orgId } = auth();
  if (!userId) throw new Error("Not authenticated");

  const db = supabaseAdmin();

  if (orgId) {
    const { data: existing } = await db
      .from("workspaces")
      .select("*")
      .eq("clerk_org_id", orgId)
      .maybeSingle();
    if (existing) return existing;

    const { data: created } = await db
      .from("workspaces")
      .insert({ clerk_org_id: orgId, owner_clerk_user_id: userId, name: "Team Workspace" })
      .select()
      .single();
    return created;
  }

  const { data: existing } = await db
    .from("workspaces")
    .select("*")
    .eq("owner_clerk_user_id", userId)
    .is("clerk_org_id", null)
    .maybeSingle();
  if (existing) return existing;

  const { data: created } = await db
    .from("workspaces")
    .insert({ owner_clerk_user_id: userId, name: "My Workspace" })
    .select()
    .single();
  return created;
}
