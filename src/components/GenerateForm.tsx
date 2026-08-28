"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateQuestionsAction } from "@/app/actions";
import { Loader2, Sparkles, BookOpenCheck } from "lucide-react";

export function GenerateForm({
  bookId,
  hasText,
}: {
  bookId: string;
  hasText: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(300);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    count: number;
    usedAi: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await generateQuestionsAction(bookId, count);
        setResult(res);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "문제 생성 실패");
      }
    });
  };

  if (!hasText) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        이 PDF에서 텍스트를 추출하지 못했습니다. 스캔본이거나 이미지 위주의
        파일이라면 문제를 생성할 수 없어요.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">기출문제 생성</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            생성할 문제 수
          </label>
          <input
            type="number"
            min={10}
            max={500}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            10~500개 사이로 설정할 수 있어요.
          </p>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isPending ? "생성 중..." : "문제 만들기"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4" />
            <span className="font-medium">
              총 {result.count}개의 문제가 생성되었습니다
            </span>
            {result.usedAi ? "(AI 출제)" : "(로컬 출제)"}
          </div>
          <p className="mt-1">
            아래 "문제 풀기" 버튼을 눌러 바로 연습하세요.
          </p>
        </div>
      )}
    </div>
  );
}
