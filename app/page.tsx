import Link from "next/link";
import { FileText, Search, ShieldCheck, Zap, CheckCircle2, XCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Grounded, not guessed",
    body: "Every answer cites the exact document and page it came from. If your documents don't contain the answer, Corpus says so instead of inventing one.",
  },
  {
    icon: Zap,
    title: "Built for real teams",
    body: "Shared workspaces, per-document access, and a usage dashboard so everyone can see what's been asked and answered.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    body: "Documents are stored per-workspace and never used to train a model. Delete a document and its index disappears with it.",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-ink min-h-screen">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="font-display text-2xl text-paper">Corpus</span>
        <div className="flex items-center gap-3">
          <Link href="/architecture" className="text-paper-dim text-sm hover:text-paper transition-colors">
            How it works
          </Link>
          <Link href="/about" className="text-paper-dim text-sm hover:text-paper transition-colors">
            About
          </Link>
          <Link href="/sign-in" className="text-paper-dim text-sm hover:text-paper transition-colors">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-gold text-ink text-sm font-medium px-4 py-2 rounded-md hover:brightness-110 transition-all"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-mono text-xs uppercase tracking-widest text-teal-light font-mono border border-teal/30 rounded-full px-3 py-1 mb-8">
          <FileText size={12} />
          Ask your documents anything
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-paper leading-[1.1] mb-6">
          Answers grounded in <span className="text-gold-light">your</span> documents.
        </h1>
        <p className="text-paper-dim text-lg max-w-xl mx-auto mb-10">
          Upload contracts, research, or internal docs. Ask a question in plain
          English. Get a precise answer with a citation you can click straight
          back to the source.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-gold text-ink font-semibold px-7 py-3 rounded-md hover:brightness-110 transition-all"
        >
          Try Corpus free
        </Link>
        <p className="text-paper-faint text-xs mt-3 font-mono">No credit card required</p>

        <div className="mt-16 text-left bg-ink-card border border-white/10 rounded-lg p-6 max-w-xl mx-auto">
          <p className="text-paper-faint text-xs font-mono uppercase tracking-wide mb-3">Sample answer</p>
          <p className="text-paper leading-relaxed">
            The termination clause requires 60 days' written notice
            <span className="citation-chip mx-1">1</span>
            and applies only after the initial 12-month term
            <span className="citation-chip mx-1">2</span>
            .
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 font-mono text-xs text-paper-faint">
            <p>[1] vendor_agreement.pdf, page 4</p>
            <p>[2] vendor_agreement.pdf, page 1</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border border-white/10 rounded-lg p-6">
              <Icon size={20} className="text-teal-light mb-4" />
              <h3 className="font-display text-xl text-paper mb-2">{title}</h3>
              <p className="text-paper-dim text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported documents */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl text-paper mb-3">What Corpus can read</h2>
          <p className="text-paper-dim max-w-xl mx-auto">
            Upload real files and Corpus indexes them for search. Here's exactly
            what's supported today.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border border-white/10 rounded-lg p-6">
            <h3 className="font-display text-xl text-paper mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-teal-light" />
              Supported
            </h3>
            <ul className="space-y-2 text-paper-dim text-sm">
              <li>PDF (.pdf)</li>
              <li>Word documents (.docx)</li>
              <li>Plain text (.txt)</li>
              <li>Markdown (.md)</li>
            </ul>
          </div>
          <div className="border border-white/10 rounded-lg p-6">
            <h3 className="font-display text-xl text-paper mb-4 flex items-center gap-2">
              <XCircle size={18} style={{ color: "#C1502E" }} />
              Not yet supported
            </h3>
            <ul className="space-y-2 text-paper-dim text-sm">
              <li>Old Word format (.doc)</li>
              <li>Scanned PDFs or images with no real text (no OCR)</li>
              <li>Excel, PowerPoint, images, or ZIP files</li>
              <li>Links or web pages — files must be uploaded directly</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="font-display text-3xl text-paper mb-3">Simple pricing</h2>
        <p className="text-paper-dim mb-10">Start free. Upgrade when your team outgrows it.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <div className="border border-white/10 rounded-lg p-6">
            <p className="font-display text-2xl text-paper mb-1">Free</p>
            <p className="text-paper-faint text-sm mb-4">For trying Corpus out</p>
            <p className="font-mono text-paper text-2xl mb-4">$0</p>
            <ul className="text-paper-dim text-sm space-y-2">
              <li>5 documents</li>
              <li>30 questions / month</li>
            </ul>
          </div>
          <div className="border border-gold/50 rounded-lg p-6 bg-gold/5">
            <p className="font-display text-2xl text-paper mb-1">Pro</p>
            <p className="text-paper-faint text-sm mb-4">For active teams</p>
            <p className="font-mono text-paper text-2xl mb-4">$29/mo</p>
            <ul className="text-paper-dim text-sm space-y-2">
              <li>500 documents</li>
              <li>2,000 questions / month</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-white/10 text-paper-faint text-xs font-mono">
        Corpus — built by{" "}
        <Link href="/about" className="text-gold-light hover:underline">
          Sai Srujan Reddy A
        </Link>{" "}
        using Next.js, Claude, and Voyage AI.
      </footer>
    </main>
  );
}