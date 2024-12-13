import type { Metadata } from "next";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

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
          <Link href="/" className="highlight-link px-2">
            <h1>Nitpicking</h1>
          </Link>

          <nav className="flex justify-between gap-6 text-lg">
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

        <section className="pt-12">{children}</section>
        <Analytics />

        <footer className="text-center pt-24 pb-4">
          <p className="text-sm">
            Made with{" "}
            <FontAwesomeIcon icon={faHeart} className="text-red-500 mx-1" /> by{" "}
            <a
              href="https://github.com/lucasfstmd"
              target="_blank"
              rel="noopener noreferrer"
              className="highlight-link font-semibold"
            >
              Lucas F. Souza
            </a>
            <br />
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
