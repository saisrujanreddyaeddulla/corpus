import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe";
import { getOrCreateWorkspace } from "@/lib/workspace";

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = await getOrCreateWorkspace();
  if (!workspace.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet" }, { status: 400 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}