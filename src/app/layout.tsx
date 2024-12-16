import type { Metadata } from "next";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "Contribute - Nitpicking",
  description: "Find and correct the error",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="px-4 sm:px-8 md:px-16 lg:px-24 my-4 sm:my-8">
        <header className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <Link href="/" className="highlight-link px-2">
            <h1 className="text-2xl sm:text-3xl">Nitpicking</h1>
          </Link>

          <nav className="flex flex-wrap justify-center sm:justify-between gap-3 sm:gap-6 text-sm sm:text-lg">
            <Link href="/" className="highlight-link px-2">
              Home
            </Link>
            <Link href="/about" className="highlight-link px-2">
              About
            </Link>
            <Link href="/howtoplay" className="highlight-link px-2">
              How to play
            </Link>
            <Link href="/contribute" className="highlight-link px-2">
              Contribute
            </Link>
          </nav>
        </header>

        <section className="pt-8 sm:pt-4">{children}</section>
        <Analytics />
        <SpeedInsights />

        <footer className="text-center pt-6 sm:pt-8 pb-4">
          <p className="text-xs sm:text-sm">
            Made with{" "}
            <FontAwesomeIcon icon={faHeart} className="text-red-500 mx-1" /> by{" "}
            <a
              href="https://github.com/LucasFASouza"
              target="_blank"
              rel="noopener noreferrer"
              className="highlight-link font-semibold"
            >
              Lucas F. Souza
            </a>
            <br className="block sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            Inspired by the show{" "}
            <a
              href="https://www.dropout.tv/um-actually"
              target="_blank"
              rel="noopener noreferrer"
              className="highlight-link font-semibold"
            >
              Um, Actually
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}

