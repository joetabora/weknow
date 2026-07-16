import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/DashboardShell";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "weknow | Market Research",
    template: "%s | weknow",
  },
  description: "A private prediction market research workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
