import { redirect } from "next/navigation";

// How to Play was merged into the About page as a section.
export default function HowToPlayPage() {
  redirect("/about#how-to-play");
}
