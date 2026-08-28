"use client";

import Image from "next/image";
import { Download, X, Share2, PlusSquare } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallPrompt() {
  const { promptInstall, isIOSSafari, hidden, setDismissed } =
    useInstallPrompt();

  if (hidden) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl md:bottom-6 md:left-auto md:right-6 md:w-96">
      <div className="flex items-start gap-4">
        <div className="shrink-0 overflow-hidden rounded-2xl shadow-sm">
          <Image
            src="/icons/icon-192x192.png"
            alt="나만의 문제집"
            width={56}
            height={56}
            className="h-14 w-14"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-900">나만의 문제집</p>
              <p className="text-sm text-slate-500">홈 화면에 추가하기</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="rounded p-1 text-slate-400 hover:bg-slate-100"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            앱처럼 설치하면 PDF 업로드와 문제 풀기가 더 편리해요.
          </p>
        </div>
      </div>

      {isIOSSafari ? (
        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <p className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-600" />
            1. Safari 하단의 공유 버튼 누르기
          </p>
          <p className="flex items-center gap-2">
            <PlusSquare className="h-4 w-4 text-blue-600" />
            2. "홈 화면에 추가" 선택
          </p>
        </div>
      ) : (
        <button
          onClick={promptInstall}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          지금 설치하기
        </button>
      )}
    </div>
  );
}
