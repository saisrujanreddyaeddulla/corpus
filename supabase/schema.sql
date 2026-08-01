-- Run this entire file in Supabase Dashboard -> SQL Editor -> New query.

create extension if not exists vector;

-- One workspace per team/org (maps 1:1 to a Clerk org, or a personal workspace per user)
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  clerk_org_id text unique,           -- null for personal workspaces
  owner_clerk_user_id text not null,
  name text not null default 'My Workspace',
  plan text not null default 'free',  -- 'free' | 'pro'
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  storage_path text not null,
  status text not null default 'processing', -- 'processing' | 'ready' | 'error'
  page_count int,
  created_at timestamptz not null default now()
);

create table if not exists chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  content text not null,
  page_number int,
  chunk_index int not null,
  embedding vector(1024) -- voyage-3 output dimension
);

create index if not exists chunks_embedding_idx on chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  clerk_user_id text not null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null, -- 'user' | 'assistant'
  content text not null,
  citations jsonb,     -- [{documentId, documentName, pageNumber, snippet}]
  created_at timestamptz not null default now()
);

create table if not exists usage_counters (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  period_start date not null default date_trunc('month', now()),
  queries_used int not null default 0,
  documents_used int not null default 0
);

-- Vector similarity search: returns the most relevant chunks for a workspace
create or replace function match_chunks(
  query_embedding vector(1024),
  match_workspace_id uuid,
  match_count int default 6
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  page_number int,
  similarity float
)
language sql stable
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.content,
    chunks.page_number,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where chunks.workspace_id = match_workspace_id
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- Row Level Security: enable and restrict service-role-only access.
-- The app talks to Supabase using the service role key from trusted server
-- code only, and enforces workspace membership itself, so RLS here is a
-- defense-in-depth backstop rather than the primary access control.
alter table workspaces enable row level security;
alter table documents enable row level security;
alter table chunks enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table usage_counters enable row level security;
