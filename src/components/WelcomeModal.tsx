import AnimatedRobin from "./AnimatedRobin";

type Props = {
  onStart: () => void;
  onStartWithTour: () => void;
};

export default function WelcomeModal({ onStart, onStartWithTour }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl card-shadow p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-4">
          <AnimatedRobin className="w-20 h-20 sm:w-24 sm:h-24 shrink-0" />
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-stone-800 leading-tight">
              Risk Robin: <span className="text-robinOrange">Sustainable Tourism</span>
            </h1>
            <p className="text-stone-600 mt-1">
              Explore how tourism affects local communities in Edinburgh.
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-stone-800 mb-5">
          <p>
            <strong>You are the Analyst.</strong> I'll walk you through six tourism
            situations. Three Edinburgh locals — a teacher, a café owner, and a
            council sustainability officer — will offer different perspectives,
            but <strong>you make the final choices</strong>.
          </p>
          <p>
            This is <strong>not a quiz</strong>. There are no right or wrong answers.
            The aim is to understand how <em>you</em> think about tourism, trade-offs,
            and what Edinburgh City Council should pay attention to.
          </p>

          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 list-none">
            {[
              { n: "1", t: "Read the Context", d: "I deal a real-ish Edinburgh tourism situation." },
              { n: "2", t: "Pick & explain", d: "Choose an Impact Card and give a real example as evidence." },
              { n: "3", t: "See the pattern", d: "Markers build up across the six categories on the board." },
            ].map((s) => (
              <li
                key={s.n}
                className="bg-pastel-cream/70 rounded-xl px-3 py-3 border border-stone-200/70"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-robinOrange">
                  Step {s.n}
                </div>
                <div className="font-semibold text-stone-800 mt-0.5">{s.t}</div>
                <div className="text-xs text-stone-600 mt-0.5 leading-snug">{s.d}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button className="btn-ghost" onClick={onStart}>
            Just start
          </button>
          <button className="btn-primary" onClick={onStartWithTour}>
            Show me around (30s) →
          </button>
        </div>
        <p className="text-[11px] text-stone-500 mt-3 text-right">
          New here? The tour is recommended — you can always re-run it from the
          header.
        </p>
      </div>
    </div>
  );
}
