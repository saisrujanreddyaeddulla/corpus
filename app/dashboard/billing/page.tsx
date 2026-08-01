import { getOrCreateWorkspace } from "@/lib/workspace";
import PricingTable from "@/components/PricingTable";

export default async function BillingPage() {
  const workspace = await getOrCreateWorkspace();

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="font-display text-3xl text-paper mb-1">Billing</h1>
      <p className="text-paper-dim text-sm mb-8">Manage your plan and subscription.</p>
      <PricingTable plan={workspace.plan} />
    </div>
  );
}
