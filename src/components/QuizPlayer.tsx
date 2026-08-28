"use client";

import { useEffect, useMemo, useState } from "react";
import { saveAttempt } from "@/app/actions";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

type Question = {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  difficulty: string | null;
};

export function QuizPlayer({
  questions: rawQuestions,
  bookId,
  title,
}: {
  questions: Question[];
  bookId: string;
  title: string;
}) {
  const questions = useMemo(
    () => [...rawQuestions].sort(() => Math.random() - 0.5),
    [rawQuestions]
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
  } | null>(null);
  const [results, setResults] = useState<
    { questionId: string; isCorrect: boolean }[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  const current = questions[index];

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setResult(null);
  }, [index]);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">풀 수 있는 문제가 없습니다.</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          <Home className="h-4 w-4" />
          홈으로
        </Link>
      </div>
    );
  }

  if (index >= questions.length) {
    const correct = results.filter((r) => r.isCorrect).length;
    const wrong = results.length - correct;
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">학습 완료!</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="전체" value={String(results.length)} />
          <SummaryCard label="정답" value={String(correct)} color="text-emerald-600" />
          <SummaryCard label="오답" value={String(wrong)} color="text-rose-600" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
            다시 풀기
          </button>
          <Link
            href="/review"
            className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-4 py-2 font-medium text-rose-700 hover:bg-rose-200"
          >
            <XCircle className="h-4 w-4" />
            틀린 문제 복습
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (selected === null || submitted || !current) return;
    setIsSaving(true);
    try {
      const res = await saveAttempt(current.id, selected);
      setResult(res);
      setSubmitted(true);
      setResults((prev) => [
        ...prev,
        { questionId: current.id, isCorrect: res.isCorrect },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const progress = Math.round(((index) / questions.length) * 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          {title}
        </span>
        <span className="text-sm font-medium text-slate-500">
          {index + 1} / {questions.length}
        </span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
        난이도 {current.difficulty ?? "중"}
      </div>
      <h2 className="whitespace-pre-line text-lg font-semibold leading-relaxed text-slate-900">
        {current.content}
      </h2>

      <div className="mt-6 space-y-3">
        {current.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = i === current.correctAnswer;
          const showCorrect = submitted && isCorrect;
          const showWrong = submitted && isSelected && !isCorrect;
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => setSelected(i)}
              className={[
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                showCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : showWrong
                  ? "border-rose-500 bg-rose-50 text-rose-900"
                  : isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300",
              ].join(" ")}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {showCorrect && <CheckCircle className="h-5 w-5 text-emerald-600" />}
              {showWrong && <XCircle className="h-5 w-5 text-rose-600" />}
            </button>
          );
        })}
      </div>

      {submitted && current.explanation && (
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <strong>해설:</strong> {current.explanation}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "채점 중..." : "정답 확인"}
          </button>
        ) : (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800"
          >
            다음 문제
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color = "text-slate-900",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
