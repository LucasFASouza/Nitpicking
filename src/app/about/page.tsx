export const metadata = {
  title: "About Nitpicking",
  description:
    "Nitpicking is a trivia game inspired by Um, Actually. Find and correct the error in each sentence.",
};

export default function AboutPage() {
  return (
    <main>
      <div className="flex items-center gap-6 py-4">
        <div className="border-black border-2 p-6 w-2/3 mx-auto">
          <h1 className="mb-2">About</h1>

          <div className="space-y-4 text-lg py-4">
            <p>
              Nitpicking is inspired by the hilarious trivia game{" "}
              <a
                className="highlight-link font-bold"
                href="https://www.youtube.com/c/umactually"
                target="_blank"
                rel="noopener noreferrer"
              >
                Um, Actually
              </a>{" "}
              (Sam Reich, if you’re reading this, please don’t sue me, also,
              where are you from?). The project is an homage to the art of
              spotting mistakes and the joy of fixing them and it’s not
              affiliated with the original show or{" "}
              <a
                className="highlight-link font-bold"
                href="https://www.dropout.tv"
                target="_blank"
                rel="noopener noreferrer"
              >
                Dropout
              </a>{" "}
              in any way.
            </p>

            <p>
              The game is simple: each sentence contains a nerdy reference with
              a sneaky mistake hidden inside. Your task is to uncover the error
              and set the record straight. You can play on your own, challenge a
              friend, or even form teams for a bit of competitive fun. For more
              details, check out our{" "}
              <a
                className="highlight-link font-bold"
                href="/howtoplay"
                target="_blank"
                rel="noopener noreferrer"
              >
                How to Play
              </a>{" "}
              page.
            </p>

            <p>
              Nitpicking is an open-source labor of love, and we’re always
              looking for ways to make it better. Check out our{" "}
              <a
                className="highlight-link font-bold"
                href="https://github.com/LucasFASouza/Nitpicking"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>{" "}
              to contribute with code, suggest improvements or nitpick our
              typos. And don’t forget to visit our{" "}
              <a
                className="highlight-link font-bold"
                href="/contribute"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute
              </a>{" "}
              page to share your own tricky sentences with the world!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
