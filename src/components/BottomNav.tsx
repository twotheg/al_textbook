"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Home, RotateCcw, Download, Share2, PlusSquare } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { promptInstall, isInstallable, isIOSSafari, isStandalone } =
    useInstallPrompt();

  const links = [
    { href: "/", icon: Home, label: "홈" },
    { href: "/review", icon: RotateCcw, label: "복습" },
  ];

  const handleInstall = () => {
    if (isIOSSafari) {
      window.alert(
        "Safari 하단의 공유 버튼(□)을 누르고 '홈 화면에 추가'를 선택하세요."
      );
      return;
    }
    if (promptInstall) {
      void promptInstall();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <ul className="flex h-16 items-center justify-around">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  "flex flex-col items-center gap-0.5 text-xs",
                  active ? "text-blue-600" : "text-slate-500",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}

        {!isStandalone && isInstallable && (
          <li>
            <button
              onClick={handleInstall}
              className="flex flex-col items-center gap-0.5 text-xs text-slate-500"
            >
              {isIOSSafari ? (
                <>
                  <PlusSquare className="h-5 w-5" />
                  <span>설치</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>설치</span>
                </>
              )}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
