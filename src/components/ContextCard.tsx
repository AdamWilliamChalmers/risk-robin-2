import { useEffect, useRef, useState } from "react";
import type { ContextCard as ContextCardT } from "../data/contextCards";
import CategoryBadge from "./CategoryBadge";

type Props = {
  card: ContextCardT;
  highlighted: boolean;
  back?: boolean;
  size?: "md" | "lg";
  /** When true, the card stretches to fill its parent's vertical space so
   *  it can sit alongside taller siblings (e.g. the Impact Assessment board)
   *  without leaving a gap underneath. */
  fillHeight?: boolean;
};

/**
 * Renders a Context Card with a CSS-3D flip animation between its back and
 * its face. The flip plays whenever a new Context is revealed: the deck back
 * is shown first, then rotates 180° on the Y axis to expose the card face.
 *
 * Layout
 *  - Outer container holds the perspective and the card's outer dimensions.
 *  - Inner container has `transform-style: preserve-3d` and is what we rotate.
 *  - Two children — face and back — sit at the same position with
 *    `backface-visibility: hidden`, the back is pre-rotated 180° so it
 *    becomes visible when the inner is rotated.
 *
 * The `back` prop forces the back face forward (used while the player has
 * not yet drawn this round's Context). The front rendering is the HTML card
 * with peach panel, ID disc, description and category icons; if a card has
 * an `image` set we render that PNG instead.
 */
export default function ContextCard({
  card,
  highlighted,
  back,
  size = "md",
  fillHeight = false,
}: Props) {
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
  const heightClass = fillHeight ? "h-full" : "";
  // Need explicit height so both flip faces (absolutely positioned) have a
  // box to fill, even when the parent doesn't enforce one.
  const minHeight = fillHeight ? undefined : size === "lg" ? 460 : 380;

  // Flip state. `flipped` true === showing the face. We initialise it to
  // false so the first render always shows the back, then we flip to the
  // face inside a useEffect. The card id is used as the "trigger" so the
  // animation re-plays on every new Context.
  const [flipped, setFlipped] = useState(false);
  const lastRevealedId = useRef<string>("");

  useEffect(() => {
    if (back || card.id === "back") {
      setFlipped(false);
      return;
    }
    // Only play the flip the first time we see this particular card id —
    // re-renders with the same data (e.g. focus changes) should not retrigger
    // the spin.
    if (card.id !== lastRevealedId.current) {
      lastRevealedId.current = card.id;
      // Make sure we start from "back showing" so the rotation animates from
      // 180° down to 0°, then schedule the actual flip.
      setFlipped(false);
      const t = window.setTimeout(() => setFlipped(true), 80);
      return () => window.clearTimeout(t);
    }
  }, [back, card.id]);

  return (
    <div
      data-area="context"
      className={`relative ${widthClass} ${heightClass} ${
        highlighted ? "highlighted" : ""
      }`}
      style={{ perspective: 1600, minHeight }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          // Card is "looking at" the camera when the inner is at 0°
          // (face), and "looking away" at 180° (back). We start at 180°
          // (back-facing) and animate down to 0°.
          transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)",
          transition:
            "transform 900ms cubic-bezier(0.22, 1.05, 0.36, 1.02)",
          minHeight,
        }}
      >
        {/* Face — drawn at the inner's natural rotation so it is what you
            see when the inner is at 0°. */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {card.image ? (
            <img
              src={`/${card.image}`}
              alt={card.title}
              className="w-full h-full object-cover rounded-3xl shadow-card animate-fadeIn"
            />
          ) : (
            <div className="w-full h-full bg-pastel-peach card-shadow flex flex-col">
              <div className="bg-white px-4 pt-5 pb-3 text-center shrink-0">
                <h3 className={titleClass}>{card.title}</h3>
              </div>
              <div className="px-4 py-5 relative flex-1 flex flex-col">
                <div className={idCircleClass}>{card.id}</div>
                <p className={descClass}>{card.description}</p>
              </div>
              <div className="flex justify-center gap-2 pb-5 shrink-0">
                {card.icons.map((c) => (
                  <CategoryBadge key={c} category={c} size={badgeSize} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back — pre-rotated 180° so the back-of-deck art is what you see
            while the inner is at 180°. */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <img
            src="/context_back.png"
            alt="Context card back"
            className="w-full h-full object-cover rounded-3xl shadow-card"
          />
        </div>
      </div>
    </div>
  );
}
