"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, FileText, CircleCheck, CircleX, Loader2 } from "lucide-react";
import DocumentUploader from "@/components/DocumentUploader";

type Doc = { id: string; name: string; status: string; page_count: number | null; created_at: string };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/documents");
    if (res.ok) setDocs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleDelete(id: string) {
    setDocs((d) => d.filter((doc) => doc.id !== id));
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="font-display text-3xl text-paper mb-1">Documents</h1>
      <p className="text-paper-dim text-sm mb-8">Upload the files you want Corpus to search.</p>

      <div className="mb-8">
        <DocumentUploader onUploaded={refresh} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-paper-dim text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : docs.length === 0 ? (
        <p className="text-paper-faint text-sm">No documents yet.</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border border-white/10 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-paper-faint flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-paper text-sm truncate">{doc.name}</p>
                  <p className="text-paper-faint text-xs font-mono">
                    {doc.page_count ? `${doc.page_count} pages` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {doc.status === "ready" && <CircleCheck size={16} className="text-teal-light" />}
                {doc.status === "processing" && <Loader2 size={16} className="animate-spin text-paper-faint" />}
                {doc.status === "error" && <CircleX size={16} style={{ color: "#C1502E" }} />}
                <button onClick={() => handleDelete(doc.id)} aria-label="Delete document">
                  <Trash2 size={15} className="text-paper-faint hover:text-paper transition-colors" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
