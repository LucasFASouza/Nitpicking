import { FC } from "react";
import { categories } from "@/lib/categories";
import { SORT_OPTIONS, SortOption } from "@/lib/searchParams";

interface Props {
  category: string | null;
  sort: SortOption;
  disabled?: boolean;
  onCategoryChange: (category: string | null) => void;
  onSortChange: (sort: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  id: "Default",
  likes: "Most liked",
  dislikes: "Most disliked",
};

const labelClass = "text-xs uppercase tracking-wide font-semibold";
const selectClass =
  "button-shadowed border-2 border-black bg-background px-3 py-2 text-sm cursor-pointer disabled:opacity-50 sm:hidden";

interface BarItem {
  value: string | null;
  label: string;
}

// Barra de botões (só no web). Botão ativo fica invertido (preto).
const ButtonBar: FC<{
  items: BarItem[];
  current: string | null;
  disabled?: boolean;
  onSelect: (value: string | null) => void;
}> = ({ items, current, disabled, onSelect }) => (
  <div className="hidden sm:flex flex-wrap gap-2">
    {items.map((item) => {
      const active = current === item.value;
      return (
        <button
          key={item.label}
          type="button"
          disabled={disabled}
          aria-pressed={active}
          onClick={() => onSelect(item.value)}
          className={`border-2 border-black px-3 py-1.5 text-sm disabled:opacity-50 ${
            active
              ? "bg-foreground text-background"
              : "button-shadowed-sm bg-background"
          }`}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);

const BrowseControls: FC<Props> = ({
  category,
  sort,
  disabled,
  onCategoryChange,
  onSortChange,
}) => {
  const categoryItems: BarItem[] = [
    { value: null, label: "All" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];
  const sortItems: BarItem[] = SORT_OPTIONS.map((s) => ({
    value: s,
    label: sortLabels[s],
  }));

  return (
    <div className="flex flex-col gap-4 mb-5 sm:mb-7">
      <div className="flex flex-col gap-2">
        <span className={labelClass}>Category</span>
        <ButtonBar
          items={categoryItems}
          current={category}
          disabled={disabled}
          onSelect={onCategoryChange}
        />
        <select
          className={selectClass}
          value={category ?? ""}
          disabled={disabled}
          onChange={(e) => onCategoryChange(e.target.value || null)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-t border-neutral-300" />

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Order by</span>
        <ButtonBar
          items={sortItems}
          current={sort}
          disabled={disabled}
          onSelect={(value) => onSortChange(value as SortOption)}
        />
        <select
          className={selectClass}
          value={sort}
          disabled={disabled}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {sortLabels[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BrowseControls;
