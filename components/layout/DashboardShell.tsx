import Link from "next/link";
import type { ReactNode } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/markets", label: "Markets" },
  { href: "/dashboard/movers", label: "Movers" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
  { href: "/dashboard/journal", label: "Journal" },
  { href: "/dashboard/resolved", label: "Resolved" },
  { href: "/dashboard/calibration", label: "Calibration" },
];

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950 px-6 py-5 text-white md:min-h-screen md:border-b-0 md:border-r md:px-7 md:py-8">
        <Link
          href="/dashboard"
          className="inline-block font-display text-2xl font-semibold tracking-[-0.04em]"
        >
          weknow
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-300">
          Market research
        </p>

        <nav
          aria-label="Primary navigation"
          className="mt-6 flex gap-5 md:mt-12 md:flex-col md:gap-1"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-l-2 border-transparent py-2 text-sm text-slate-300 transition-colors duration-200 hover:border-cyan-300 hover:text-white md:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
