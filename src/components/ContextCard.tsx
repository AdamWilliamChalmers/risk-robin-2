import type { ContextCard as ContextCardT } from "../data/contextCards";
import CategoryBadge from "./CategoryBadge";

type Props = {
  card: ContextCardT;
  highlighted: boolean;
  back?: boolean;
  size?: "md" | "lg";
};

/**
 * Renders a Context Card. If an `image` is set on the card, we render the
 * pre-baked PNG (currently only C1 has art). Otherwise we render a styled HTML
 * card that mimics the same layout: pastel peach panel, big title, ID badge,
 * description, then the row of category icons.
 *
 * The optional `size` prop ("md" by default) bumps the card to a roomier
 * width when it sits in a side-by-side layout next to the progress board.
 *
 * TODO: extract the remaining context PNGs into /public and reference them on
 * each ContextCard.
 */
export default function ContextCard({ card, highlighted, back, size = "md" }: Props) {
  const widthClass =
    size === "lg" ? "w-72 sm:w-80 md:w-[22rem]" : "w-64 sm:w-72";
  const titleClass =
    size === "lg"
      ? "font-display text-3xl leading-tight text-stone-800"
      : "font-display text-2xl leading-tight text-stone-800";
  const descClass =
    size === "lg"
      ? "text-stone-700 text-base leading-relaxed text-center"
      : "text-stone-700 text-sm leading-relaxed text-center";
  const idCircleClass =
    size === "lg"
      ? "-mt-10 mb-3 mx-auto w-14 h-14 rounded-full bg-pastel-peach border-4 border-white flex items-center justify-center font-bold text-stone-700 text-lg"
      : "-mt-9 mb-2 mx-auto w-12 h-12 rounded-full bg-pastel-peach border-4 border-white flex items-center justify-center font-bold text-stone-700";
  const badgeSize = size === "lg" ? "lg" : "md";

  if (back) {
    return (
      <div className={`relative ${highlighted ? "highlighted" : ""}`} data-area="context">
        <img
          src="/context_back.png"
          alt="Context card back"
          className={`${widthClass} rounded-2xl shadow-card`}
        />
      </div>
    );
  }

  if (card.image) {
    return (
      <div className={`relative ${highlighted ? "highlighted" : ""} animate-fadeIn`} data-area="context">
        <img
          src={`/${card.image}`}
          alt={card.title}
          className={`${widthClass} rounded-2xl shadow-card`}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${widthClass} rounded-3xl overflow-hidden bg-pastel-peach card-shadow animate-fadeIn ${
        highlighted ? "highlighted" : ""
      }`}
      data-area="context"
    >
      {/* Title strip (white) like the printed cards */}
      <div className="bg-white px-4 pt-5 pb-3 text-center">
        <h3 className={titleClass}>{card.title}</h3>
      </div>
      {/* Peach band with ID circle and description */}
      <div className="px-4 py-5 relative">
        <div className={idCircleClass}>
          {card.id}
        </div>
        <p className={descClass}>{card.description}</p>
      </div>
      {/* Icons row */}
      <div className="flex justify-center gap-2 pb-5">
        {card.icons.map((c) => (
          <CategoryBadge key={c} category={c} size={badgeSize} />
        ))}
      </div>
    </div>
  );
}
