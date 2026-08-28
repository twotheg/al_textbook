"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, FileText, X } from "lucide-react";

export function UploadBox() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setError("PDF 파일만 업로드할 수 있어요.");
        return;
      }
      setError(null);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "업로드에 실패했습니다.");
        }
        router.push(`/books/${data.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "업로드 실패");
      } finally {
        setIsUploading(false);
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
          accept="application/pdf"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        ) : (
          <UploadCloud className="h-10 w-10 text-blue-600" />
        )}
        <p className="mt-3 font-medium text-slate-700">
          {isUploading ? "PDF를 분석 중이에요..." : "PDF를 여기에 끌어다 놓거나 클릭"}
        </p>
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
