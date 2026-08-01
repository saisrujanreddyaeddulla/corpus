import Link from "next/link";
import { Mail, Phone, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-ink min-h-screen">
      <nav className="max-w-4xl mx-auto px-6 py-6">
        <Link
          href="/"
          className="text-paper-dim text-sm hover:text-paper transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Corpus
        </Link>
      </nav>

      <section className="max-w-md mx-auto px-6 pb-24 text-center">
        <img
          src="/creator.png"
          alt="Sai Srujan Reddy A"
          className="w-32 h-32 rounded-full mx-auto mb-6 border border-white/10 object-cover"
        />
        <h1 className="font-display text-3xl text-paper mb-1">Sai Srujan Reddy A</h1>
        <p className="text-gold-light text-sm font-mono mb-6">
          Generative AI Engineer | Building Intelligent AI Applications
        </p>
        <p className="text-paper-dim text-sm leading-relaxed mb-8">
          Corpus was designed and built end-to-end — from the RAG pipeline to
          the interface you're using right now.
        </p>
        <div className="flex flex-col items-center gap-3">
          <a
            href="mailto:saisrujanreddyaeddulla@gmail.com"
            className="inline-flex items-center gap-2 text-sm text-paper-dim hover:text-paper border border-white/10 rounded-md px-4 py-2 transition-colors"
          >
            <Mail size={14} /> saisrujanreddyaeddulla@gmail.com
          </a>
          <a
            href="tel:+919676765312"
            className="inline-flex items-center gap-2 text-sm text-paper-dim hover:text-paper border border-white/10 rounded-md px-4 py-2 transition-colors"
          >
            <Phone size={14} /> +91 96767 65312
          </a>
        </div>
      </section>
    </main>
  );
}