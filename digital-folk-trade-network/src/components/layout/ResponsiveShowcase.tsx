"use client";

const highlights = [
  {
    title: "Mobile-first",
    body: "Stacked content with generous tap targets for 1-handed use.",
  },
  {
    title: "Tablet grid",
    body: "Two-column cards align summaries and CTAs for browsing.",
  },
  {
    title: "Desktop density",
    body: "Three-column grid with space for stats and imagery.",
  },
];

export default function ResponsiveShowcase() {
  return (
    <section className="flex flex-col gap-8 rounded-2xl bg-gradient-to-br from-white/5 via-white/2 to-white/5 p-6 shadow-glow backdrop-blur-md ring-1 ring-white/10 dark:from-surface-dark/40 dark:to-surface-dark/20">
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark dark:text-brand-light">Responsive & Themed</p>
          <h2 className="text-2xl font-semibold leading-tight text-text-base dark:text-text-onDark">
            A hero that adapts at xs → xl breakpoints
          </h2>
          <p className="text-sm text-text-muted dark:text-text-onDark/70">
            Resize the viewport to watch layout shifts: stacked actions on phones, split grid on tablets, and a denser column layout on desktop.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-brand text-surface-dark px-4 py-2 text-sm font-semibold shadow-glow transition hover:-translate-y-[1px]">
              Primary action
            </button>
            <button className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-text-base transition hover:border-white/40 dark:text-text-onDark">
              Secondary
            </button>
          </div>
        </div>

        <div className="h-full w-full rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.16),transparent_40%),radial-gradient(circle_at_70%_0%,rgba(168,85,247,0.18),transparent_40%)] p-4 ring-1 ring-white/10">
          <div className="grid h-full gap-3 xs:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-text-base shadow-sm backdrop-blur dark:text-text-onDark"
              >
                <h3 className="text-base font-semibold mb-1 text-brand dark:text-brand-light">{item.title}</h3>
                <p className="text-xs leading-relaxed text-text-muted dark:text-text-onDark/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
