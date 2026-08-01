import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateWorkspace } from "@/lib/workspace";
import { checkQueryLimit, checkDocumentLimit } from "@/lib/usage";
import UsageMeter from "@/components/UsageMeter";

export default async function OverviewPage() {
  const workspace = await getOrCreateWorkspace();
  const [queryUsage, docUsage] = await Promise.all([
    checkQueryLimit(workspace.id, workspace.plan),
    checkDocumentLimit(workspace.id, workspace.plan),
  ]);

  const db = supabaseAdmin();
  const { count: readyDocs } = await db
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)
    .eq("status", "ready");

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="font-display text-3xl text-paper mb-1">Overview</h1>
      <p className="text-paper-dim text-sm mb-8">
        {workspace.name} · <span className="capitalize">{workspace.plan}</span> plan
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <UsageMeter label="Questions this month" used={queryUsage.used} limit={queryUsage.limit} />
        <UsageMeter label="Documents indexed" used={docUsage.used} limit={docUsage.limit} />
      </div>

      <div className="border border-white/10 rounded-lg p-6">
        <p className="text-paper text-sm">
          {readyDocs ?? 0} document{readyDocs === 1 ? "" : "s"} ready to search.
        </p>
        <p className="text-paper-faint text-xs mt-1">
          Head to Documents to upload more, or Chat to start asking questions.
        </p>
      </div>
    </div>
  );
}
