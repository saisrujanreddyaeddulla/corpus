import Link from "next/link";
import { Upload, Scissors, Boxes, Search, MessageSquare, ArrowRight, ArrowDown } from "lucide-react";

const STAGES = [
  {
    icon: Upload,
    label: "1. Upload",
    title: "Upload a document",
    detail: "PDF, DOCX, TXT, or MD — stored in Supabase Storage, scoped to your workspace.",
  },
  {
    icon: Scissors,
    label: "2. Chunk",
    title: "Split into chunks",
    detail: "Text is extracted (with OCR fallback for scanned pages), then split into ~900-character overlapping chunks.",
  },
  {
    icon: Boxes,
    label: "3. Embed",
    title: "Generate embeddings",
    detail: "Each chunk is converted into a 1024-dimension vector using Voyage AI.",
  },
  {
    icon: Search,
    label: "4. Search",
    title: "Retrieve relevant chunks",
    detail: "Your question is embedded the same way; pgvector finds the closest matches by cosine similarity.",
  },
  {
    icon: MessageSquare,
    label: "5. Answer",
    title: "Generate a grounded answer",
    detail: "Claude reads only the retrieved chunks and answers with inline citations, streamed back live.",
  },
];

const STACK = [
  "Next.js 14",
  "TypeScript",
  "Clerk — auth",
  "Supabase + pgvector",
  "Voyage AI — embeddings",
  "Claude — generation",
  "Stripe — billing",
  "Vercel — hosting",
];

export default function ArchitecturePage() {
  return (
    <main className="bg-ink min-h-screen">
      <nav className="max-w-5xl mx-auto px-6 py-6">
        <Link
          href="/"
          className="text-paper-dim text-sm hover:text-paper transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowRight size={14} className="rotate-180" /> Back to Corpus
        </Link>
      </nav>

      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <h1 className="font-display text-4xl sm:text-5xl text-paper mb-4">How Corpus works</h1>
        <p className="text-paper-dim max-w-xl mx-auto">
          Every answer is grounded in your own documents, not the model's memory.
          Here's the full pipeline, from upload to answer.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={stage.label} className="flex flex-col sm:flex-row items-center flex-1">
                <div className="border border-white/10 rounded-lg p-5 bg-ink-card flex-1 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={16} className="text-teal-light" />
                    <span className="font-mono text-xs text-paper-faint uppercase tracking-wide">
                      {stage.label}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-paper mb-2">{stage.title}</h3>
                  <p className="text-paper-dim text-sm leading-relaxed">{stage.detail}</p>
                </div>
                {i < STAGES.length - 1 && (
                  <>
                    <ArrowDown size={18} className="text-paper-faint my-3 sm:hidden flex-shrink-0" />
                    <ArrowRight size={18} className="text-paper-faint mx-3 hidden sm:block flex-shrink-0" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="font-display text-2xl text-paper mb-5 text-center">Built with</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {STACK.map((item) => (
            <span
              key={item}
              className="font-mono text-xs text-paper-dim border border-white/10 rounded-full px-3 py-1.5"
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}