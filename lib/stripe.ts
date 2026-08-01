import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in .env.local");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
  }
  return _stripe;
}

export const PLAN_LIMITS = {
  free: { maxDocuments: 5, maxQueriesPerMonth: 30 },
  pro: { maxDocuments: 500, maxQueriesPerMonth: 2000 },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;
