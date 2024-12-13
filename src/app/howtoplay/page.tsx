export const metadata = {
  title: "How to Play - Nitpicking",
  description: "Learn how to play Nitpicking - Find and correct nerdy errors",
};

export default function HowToPlayPage() {
  return (
    <main>
      <div className="flex items-center gap-6 py-4">
        <div className="border-black border-2 p-6 w-2/3 mx-auto">
          <h1 className="mb-2">How to Play</h1>

          <div className="space-y-4 text-lg py-4">
            <p>
              Each round presents you with a sentence about pop culture,
              science, or general nerd knowledge. While the sentence might seem
              correct at first glance, there's always one sneaky error hiding in
              plain sight.
            </p>

            <h2 className="mt-6 mb-2">Playing Solo</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Read the sentence carefully</li>
              <li>
                Click the eye icon when you think you've found the mistake
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

            <h2 className="mt-6 mb-2">Playing with Friends</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Choose a host for the round to read the sentences out loud
              </li>
              <li>
                The other players must interrupt the host when they think
                they've spotted the error
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

            <p className="mt-4">
              Ready to start nitpicking? Head back to the{" "}
              <a href="/" className="highlight-link font-bold">
                home page
              </a>{" "}
              and show off your knowledge!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
