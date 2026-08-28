"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { extractTextFromFile } from "@/lib/pdf-client";
import { UploadCloud, Loader2, FileText, X } from "lucide-react";

export function UploadBox() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "extracting" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("PDF 파일만 업로드할 수 있어요.");
        return;
      }
      setError(null);
      setPhase("extracting");

      try {
        const parsed = await extractTextFromFile(file);

        if (parsed.text.length < 50) {
          throw new Error("PDF에서 충분한 텍스트를 추출하지 못했습니다.");
        }

        setPhase("uploading");

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: file.name.replace(/\.pdf$/i, ""),
            text: parsed.text,
            pageCount: parsed.numpages,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "업로드에 실패했습니다.");
        }

        router.push(`/books/${data.id}`);
      } catch (err) {
        setPhase("idle");
        setError(err instanceof Error ? err.message : "업로드 실패");
      }
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const label =
    phase === "extracting"
      ? "PDF에서 텍스트를 추출하는 중..."
      : phase === "uploading"
      ? "서버에 저장 중..."
      : "PDF를 여기에 끌어다 놓거나 클릭";

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-white hover:border-blue-400",
        ].join(" ")}
      >
        <input
          type="file"
          accept=".pdf"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={phase !== "idle"}
        />
        {phase !== "idle" ? (
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        ) : (
          <UploadCloud className="h-10 w-10 text-blue-600" />
        )}
        <p className="mt-3 font-medium text-slate-700">{label}</p>
        <p className="mt-1 text-sm text-slate-500">
          교과서/문제집 PDF에서 텍스트를 추출해 문제를 만듭니다.
        </p>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export function FileIcon() {
  return <FileText className="h-5 w-5 text-slate-400" />;
}
