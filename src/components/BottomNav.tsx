"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, RotateCcw } from "lucide-react";

const links = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/review", icon: RotateCcw, label: "복습" },
];

export function BottomNav() {
  const pathname = usePathname();

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
      </ul>
    </nav>
  );
}
