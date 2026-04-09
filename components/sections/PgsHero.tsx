import type { PgsHeroSection } from '@/sanity/types';

interface PgsHeroProps {
  data?: PgsHeroSection | null;
}

export function PgsHero({ data }: Readonly<PgsHeroProps>) {
  if (!data) return null;

  const eyebrow = data.eyebrow || 'Browse Properties';
  const mainTitle = data.mainTitle;
  const subtitle = data.subtitle;

  if (!mainTitle) return null;

  return (
    <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_32%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {mainTitle}
          </h1>
          {subtitle ? (
            <p className="mt-5 text-lg leading-8 text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

