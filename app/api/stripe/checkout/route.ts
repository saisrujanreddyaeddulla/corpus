import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { getOrCreateWorkspace } from "@/lib/workspace";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getOrCreateWorkspace();
  const db = supabaseAdmin();

  let customerId = workspace.stripe_customer_id;
  if (!customerId) {
    const customer = await getStripe().customers.create({ metadata: { workspaceId: workspace.id } });
    customerId = customer.id;
    await db.from("workspaces").update({ stripe_customer_id: customerId }).eq("id", workspace.id);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: { workspaceId: workspace.id },
  });

  return NextResponse.json({ url: session.url });
}