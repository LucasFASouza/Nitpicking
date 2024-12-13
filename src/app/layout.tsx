import type { Metadata } from "next";
import "./globals.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Nitpicking",
  description: "Find and correct the error",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="mx-24 my-8">
        <header className="flex justify-between items-center">
          <a href="/" className="highlight-link px-2">
            <h1>Nitpicking</h1>
          </a>

          <nav className="flex justify-between gap-6 text-lg">
            <a href="/" className="highlight-link px-2">
              Home
            </a>
            <a href="/about" className="highlight-link px-2">
              About
            </a>
            <a href="/howtoplay" className="highlight-link px-2">
              How to play
            </a>
            <a href="/contribute" className="highlight-link px-2">
              Contribute
            </a>
          </nav>
        </header>

        <section className="pt-12">{children}</section>
      </body>
    </html>
  );
}
