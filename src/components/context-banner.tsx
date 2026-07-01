import { FC } from "react";
import Link from "next/link";

interface Props {
  backHref: string;
  label: string | null;
  position: number | null;
  total: number;
}

// Único botão de voltar à listagem, rotulado com o contexto + posição.
// Ex.: "← Category: Games · 3 / 50" ou "← Search: “batman” · 1 / 4".
const ContextBanner: FC<Props> = ({ backHref, label, position, total }) => (
  <div className="text-sm pb-2">
    <Link href={backHref} className="highlight-link font-semibold">
      ← {label ?? "All sentences"}
      {position !== null && total > 0 ? ` · ${position} / ${total}` : ""}
    </Link>
  </div>
);

export default ContextBanner;
