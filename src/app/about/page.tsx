import Link from "next/link";

export const metadata = {
  title: "About - Nitpicking",
  description:
    "About Nitpicking and how to play — find and correct the hidden error in each sentence.",
};

export default function AboutPage() {
  return (
    <main>
      <div className="flex items-center gap-4 sm:gap-6 py-2 sm:py-4">
        <div className="box-shadowed border-black border-2 p-4 sm:p-6 w-[95%] sm:w-[85%] md:w-2/3 mx-auto">
          {/* About */}
          <h2 className="text-lg sm:text-2xl mb-2 sm:mb-4">About</h2>

          <div className="space-y-4 text-sm sm:text-lg py-2 sm:py-4">
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
              friend, or even form teams for a bit of competitive fun — see the{" "}
              <Link className="highlight-link font-bold" href="#how-to-play">
                How to Play
              </Link>{" "}
              section below.
            </p>

            <p>
              The project is open-source and build with Next.js, Tailwind CSS,
              Drizzle ORM and TypeScript. If you know any of that stuff and want
              to help, we would love to have you on board. Check out our{" "}
              <a
                className="highlight-link font-bold"
                href="https://github.com/LucasFASouza/Nitpicking"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>{" "}
              to know more. If you’re not a developer, you can still nitpick our
              typos, bugs, incorrect statements and suggest new features. Spotted
              a mistake in one of our sentences? Once you reveal the answer, hit
              the{" "}
              <span className="font-bold">&ldquo;Um, actually&hellip;&rdquo;</span>{" "}
              link right on the sentence to flag it. For anything else,{" "}
              <a
                className="highlight-link font-bold"
                href="https://github.com/LucasFASouza/Nitpicking/issues/new/choose"
                target="_blank"
                rel="noopener noreferrer"
              >
                open an issue
              </a>{" "}
              and let us know!
            </p>

            <p>
              Finally, if you have your own nitpickable statements to share with
              the world, we would love to hear from you. Visit our{" "}
              <Link className="highlight-link font-bold" href="/contribute">
                Suggest
              </Link>{" "}
              page to share your own tricky sentences with the world!
            </p>
          </div>

          {/* How to Play */}
          <h2
            id="how-to-play"
            className="text-lg sm:text-2xl mt-8 mb-2 sm:mb-4 scroll-mt-24"
          >
            How to Play
          </h2>

          <div className="space-y-4 text-sm sm:text-lg py-2 sm:py-4">
            <p>
              Each round presents you with a sentence about pop culture,
              science, or general nerd knowledge. While the sentence might seem
              correct at first glance, there&apos;s always one sneaky error
              hiding in plain sight.
            </p>

            <h3 className="mt-6 mb-2">Playing Solo</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Read the sentence carefully</li>
              <li>
                Click the eye icon when you think you&apos;ve found the mistake
              </li>
              <li>
                The incorrect part will be highlighted in yellow and the
                correction will be shown
              </li>
              <li>Check if you spotted the mistake correctly</li>
              <li>
                Give a thumbs up to sentences you found helpful or interesting
              </li>
            </ol>

            <h3 className="mt-6 mb-2">Playing with Friends</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Choose a host for the round to read the sentences out loud
              </li>
              <li>
                The other players must interrupt the host when they think
                they&apos;ve spotted the error
              </li>
              <li>
                The first player to identify the mistake and explain the
                correction earns the point
              </li>
              <li>
                If a player only identifies the error, the others can steal the
                point by providing the correction
              </li>
              <li>
                If no one can find the mistake, the host may provide a hint by
                revealing the area of the mistake
              </li>
              <li>The winner of the round becomes the host for the next one</li>
              <li>Click the shuffle button to get the next sentence</li>
              <li>Keep track of points and crown your ultimate nitpicker!</li>
            </ol>

            <p className="mt-6">
              Remember: The errors can be subtle! They might be wrong dates,
              misspelled names, incorrect locations, or mixed-up facts. Stay
              sharp, question everything, and trust your inner nitpicker!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
