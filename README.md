# Corpus

AI-powered SaaS that lets teams upload documents (PDF, DOCX, TXT, MD) and ask
questions in plain English, getting answers grounded in — and cited to — the
exact source page. Built as a portfolio project demonstrating a real RAG
pipeline, not just an API wrapper.

## What it demonstrates

- **RAG pipeline**: text extraction → chunking → embeddings (Voyage AI) →
  pgvector similarity search → grounded generation (Claude) with citations
- **Streaming**: token-by-token streamed answers over a Next.js API route
- **Multi-tenant SaaS**: Clerk auth + organizations, per-workspace data isolation
- **Billing**: Stripe subscriptions (Free/Pro), Checkout, Customer Portal, webhooks
- **Usage enforcement**: plan-based document and query limits

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind · Clerk · Supabase (Postgres +
pgvector + Storage) · Claude (Anthropic API) · Voyage AI embeddings · Stripe

---

## 1. Create your accounts (all free to start)

1. **Clerk** — [clerk.com](https://clerk.com) → Create application →
   Dashboard → API Keys. Copy the publishable and secret keys.
2. **Supabase** — [supabase.com](https://supabase.com) → New project →
   Settings → API. Copy the URL, anon key, and service role key.
3. **Anthropic** — [console.anthropic.com](https://console.anthropic.com) →
   API Keys → create one.
4. **Voyage AI** — [dashboard.voyageai.com](https://dashboard.voyageai.com) →
   API Keys → create one. (Generous free tier, pairs naturally with Claude.)
5. **Stripe** — [dashboard.stripe.com](https://dashboard.stripe.com) →
   Developers → API keys. Also create a Product called "Pro" with a monthly
   recurring price (e.g. $29/mo) → copy its Price ID.

## 2. Set up Supabase

1. In the Supabase SQL Editor, paste and run the entire contents of
   `supabase/schema.sql`. This enables pgvector and creates all tables plus
   the `match_chunks` similarity search function.
2. Go to Storage → Create a new bucket named `documents`. Keep it **private**
   (not public) — the app only ever accesses it via the service role key.

## 3. Set up Stripe webhook (for local dev)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This prints a webhook signing secret starting with `whsec_` — use that for
`STRIPE_WEBHOOK_SECRET` locally. For production, add a webhook endpoint in
the Stripe Dashboard pointing at `https://yourdomain.com/api/stripe/webhook`
and use the secret it gives you.

## 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in every value from steps 1–3.

## 5. Run locally

```bash
npm install
npm run dev
```

Visit `localhost:3000`, sign up, upload a document, and ask it a question.

---

## Deploying (Vercel — free)

1. Push this project to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo.
3. In the Vercel project's Environment Variables settings, add every key
   from `.env.local`, but set `NEXT_PUBLIC_APP_URL` to your Vercel URL
   (e.g. `https://corpus-yourname.vercel.app`).
4. Deploy.
5. Add a production Stripe webhook endpoint pointing at
   `https://your-vercel-url/api/stripe/webhook`, copy its secret, and update
   `STRIPE_WEBHOOK_SECRET` in Vercel's env vars, then redeploy.
6. (Optional) Add a custom domain in Vercel's project settings — a real
   domain reads much better on a resume/GitHub than a `.vercel.app` URL.

---

## For your resume / GitHub

Some framing that's accurate to what's actually built here:

> Designed and built Corpus, a full-stack RAG SaaS enabling teams to query
> their documents in natural language with cited, grounded answers. Built a
> production ingestion pipeline (PDF/DOCX parsing, chunking, Voyage AI
> embeddings, pgvector similarity search) and a streaming Claude-powered
> chat interface. Implemented multi-tenant auth, Stripe subscription
> billing, and usage-based plan enforcement.

## Honest next steps (worth doing before calling it "done")

This is a real, working MVP — not a toy — but a few things are simplified
and worth mentioning if asked, or building out further:
- Document processing runs synchronously in the upload request; a queue
  (e.g. Inngest, or a Vercel background function) would handle large files
  and scale better.
- No automated tests yet — adding a few for the chunking and retrieval logic
  would strengthen the portfolio story.
- No admin analytics beyond basic usage counters.
- Team member invites aren't built (Clerk supports orgs, but the UI for
  inviting teammates into a workspace isn't wired up yet).
