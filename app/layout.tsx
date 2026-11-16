import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Facilities Directory",
  description: "Community-submitted, admin-reviewed public facilities"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-semibold text-brand-800 no-underline">Public Facilities</Link>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/">Home</Link>
              <Link href="/map">Map</Link>
              <Link href="/upload">Submit Facility</Link>
              <Link href="/approval">Admin</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
