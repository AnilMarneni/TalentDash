"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isSalariesActive = pathname === "/salaries" || pathname.startsWith("/companies/");
  const isCompareActive = pathname === "/compare";

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/salaries"
            className="text-base font-bold tracking-tight text-zinc-900 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="bg-rose-500 text-white w-6 h-6 flex items-center justify-center rounded font-black shadow-xs shadow-rose-500/10">
              T
            </span>
            <span className="tracking-tight font-extrabold">
              Talent<span className="text-rose-500">Dash</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/salaries"
              className={`text-xs font-semibold h-16 flex items-center border-b-2 transition-colors ${
                isSalariesActive
                  ? "border-rose-500 text-zinc-900 font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Salaries
            </Link>
            <Link
              href="/compare"
              className={`text-xs font-semibold h-16 flex items-center border-b-2 transition-colors ${
                isCompareActive
                  ? "border-rose-500 text-zinc-900 font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Compare
            </Link>
          </nav>
        </div>
        <div>
          <Link
            href="/compare"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-900 px-3.5 text-xs font-bold text-white hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:ring-offset-1 transition shadow-sm"
          >
            Compare Tool
          </Link>
        </div>
      </div>
    </header>
  );
}
