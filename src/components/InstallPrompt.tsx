"use client";

import { Download, X, Share2, PlusSquare } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallPrompt() {
  const {
    promptInstall,
    isIOSSafari,
    hidden,
    setDismissed,
  } = useInstallPrompt();

  if (hidden) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg md:bottom-6 md:left-auto md:right-6 md:w-96">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-900">나만의 문제집 설치하기</p>
          <p className="mt-1 text-sm text-slate-600">
            홈 화면에 추가하면 앱처럼 빠르게 사용할 수 있어요.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isIOSSafari ? (
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-600" />
            1. 아래 공유 버튼
            <span className="font-sans text-blue-600">□</span>를 눌러요
          </p>
          <p className="flex items-center gap-2">
            <PlusSquare className="h-4 w-4 text-blue-600" />
            2. "홈 화면에 추가"를 선택하세요
          </p>
        </div>
      ) : (
        <button
          onClick={promptInstall}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          홈 화면에 설치
        </button>
      )}
    </div>
  );
}
