import type { Metadata } from "next";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
