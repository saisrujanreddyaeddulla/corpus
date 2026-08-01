"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function DocumentUploader({ onUploaded }: { onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/documents/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Failed to upload ${file.name}`);
        break;
      }
    }

    setUploading(false);
    onUploaded();
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border border-dashed border-white/20 rounded-lg p-10 text-center cursor-pointer hover:border-gold/50 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="mx-auto animate-spin text-paper-dim" size={22} />
        ) : (
          <Upload className="mx-auto text-paper-faint" size={22} />
        )}
        <p className="text-paper-dim text-sm mt-3">
          {uploading ? "Uploading and indexing…" : "Drop files here, or click to browse"}
        </p>
        <p className="text-paper-faint text-xs mt-1 font-mono">PDF, DOCX, TXT, MD</p>
      </div>
      {error && <p className="text-sm mt-3" style={{ color: "#C1502E" }}>{error}</p>}
    </div>
  );
}
