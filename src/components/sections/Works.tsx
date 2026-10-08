import { useRef, type ChangeEvent, type CSSProperties } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { works, type Work } from '../../data/works';
import { cn } from '../../lib/cn';

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
const EASE = [0.22, 1, 0.36, 1] as const;

/* Одне м'яке появлення: opacity + невеликий зсув */
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.8, delay, ease: EASE },
});

/* Розкладка «мозаїкою» на десктопі: перша плитка велика (2×2), решта по одній клітинці */
const bento = ['lg:col-span-2 lg:row-span-2', '', '', '', '', ''];

/* ==========================================================================
   Заглушки-«фото»: чисті CSS-градієнти, жодного файлу і жодного запиту.
   Коли з'явиться реальне фото, плитка покаже його замість цього.
   ========================================================================== */
const palettes = [
  {
    hillBack: '#5f9b75',
    hillFront: '#356648',
    lawn: '#b9e04a',
    lawnDark: '#7fa02c',
    tree: '#285038',
  },
  {
    hillBack: '#46805c',
    hillFront: '#285038',
    lawn: '#cdec74',
    lawnDark: '#8ab72a',
    tree: '#1f3d2b',
  },
  {
    hillBack: '#6fa985',
    hillFront: '#46805c',
    lawn: '#a9d24a',
    lawnDark: '#6f9a2a',
    tree: '#2c5a3d',
  },
];

const treeBg = (c: string) =>
  `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${c} 70%, white), ${c} 70%)`;

function Scene({ kind, seed }: { kind: 'before' | 'after'; seed: number }) {
  const p = palettes[seed % palettes.length];
  const messy = kind === 'before';

  // «До»: тьмяні, жовтуваті кольори й проплішини. «Після»: соковитий газон зі смугами.
  const sky = messy ? ['#e4e3d2', '#efece0'] : ['#dff0d2', '#f6f3ea'];
  const lawn = messy ? ['#a39a52', '#857636'] : [p.lawn, p.lawnDark];
  const stripes = messy
    ? [
        'radial-gradient(ellipse 14% 9% at 22% 38%, #6f5a34 0 55%, transparent 75%)',
        'radial-gradient(ellipse 18% 11% at 56% 62%, #5f4e2e 0 55%, transparent 75%)',
        'radial-gradient(ellipse 12% 8% at 82% 30%, #7a6339 0 55%, transparent 75%)',
        'radial-gradient(ellipse 16% 9% at 40% 82%, #6b5a35 0 55%, transparent 75%)',
        'radial-gradient(ellipse 10% 7% at 90% 78%, #5f4e2e 0 55%, transparent 75%)',
        `linear-gradient(${lawn[0]}, ${lawn[1]})`,
      ].join(',')
    : [
        'repeating-linear-gradient(90deg, rgb(255 255 255 / 0.16) 0 5%, transparent 5% 10%)',
        `linear-gradient(${lawn[0]}, ${lawn[1]})`,
      ].join(',');

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle at ${seed % 2 ? 24 : 78}% 16%, rgb(255 255 255 / 0.85), transparent 34%), linear-gradient(${sky[0]}, ${sky[1]})`,
      }}
    >
      {/* Пагорби двома шарами */}
      <div
        className="absolute -inset-x-[15%] top-[40%] h-[60%] rounded-[50%]"
        style={{ background: messy ? '#7c9a76' : p.hillBack }}
      />
      <div
        className="absolute -inset-x-[25%] top-[50%] h-[70%] rounded-[50%]"
        style={{ background: messy ? '#5f7f5a' : p.hillFront }}
      />

      {/* Дерева: м'які кулі з підсвіткою */}
      <div
        className="absolute top-[24%] aspect-square w-[22%] rounded-full"
        style={{
          left: seed % 2 ? '62%' : '14%',
          background: treeBg(messy ? '#4f7a58' : p.tree),
        }}
      />
      <div
        className="absolute top-[34%] aspect-square w-[15%] rounded-full"
        style={{
          left: seed % 2 ? '22%' : '70%',
          background: treeBg(messy ? '#4f7a58' : p.tree),
        }}
      />

      {/* Газон у перспективі: смуги збігаються до горизонту */}
      <div className="absolute inset-x-0 bottom-0 h-[48%] overflow-hidden [perspective:260px]">
        <div
          className="absolute inset-x-[-45%] bottom-0 h-[170%] origin-bottom [transform:rotateX(64deg)]"
          style={{ backgroundImage: stripes }}
        />
      </div>

      {/* Віньєтка */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_55%,rgb(17_38_26/0.28))]" />
    </div>
  );
}

const imgClass = 'absolute inset-0 size-full object-cover';

/**
 * Слайдер «до / після» на звичайному <input type="range">: нативний, працює пальцем
 * і мишею, вертикальний скрол сторінки не блокує. Позиція пишеться в CSS-змінну
 * напряму, без React-стану, тому без лагів.
 */
function Compare({ work, index }: { work: Work; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const label = work.caption ?? `Робота ${work.id}`;

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--pos', `${event.currentTarget.value}%`);
    el.dataset.touched = '1';
  };

  return (
    <div
      ref={ref}
      style={{ '--pos': '50%' } as CSSProperties}
      className="group/cmp absolute inset-0 select-none"
    >
      {/* Після: нижній шар */}
      {work.after ? (
        <img
          src={work.after}
          alt={`${label}: після`}
          loading="lazy"
          decoding="async"
          className={imgClass}
        />
      ) : (
        <Scene kind="after" seed={index} />
      )}

      {/* До: верхній шар, обрізається clip-path за позицією повзунка */}
      <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--pos))_0_0)]">
        {work.before ? (
          <img
            src={work.before}
            alt={`${label}: до`}
            loading="lazy"
            decoding="async"
            className={imgClass}
          />
        ) : (
          <Scene kind="before" seed={index} />
        )}
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-forest-950/70 px-3 py-1 font-display text-xs font-semibold text-cream-50">
        До
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-lime-400 px-3 py-1 font-display text-xs font-semibold text-forest-950">
        Після
      </span>

      {/* Лінія на фото */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[var(--pos)] w-0.5 -translate-x-1/2 bg-cream-50 shadow-[0_0_0_1px_rgb(17_38_26/0.25)]"
      >
        <span className="absolute top-1/2 left-1/2 hidden size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream-50 text-forest-900 shadow-lift lg:grid">
          <Arrows />
        </span>
      </div>

      {/* Телефон: окрема смужка-повзунок під фото, щоб свайп каруселі не плутався з перетягуванням */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 bottom-14 flex h-12 items-center justify-between rounded-full bg-forest-950/80 px-4 font-display text-xs font-semibold text-cream-50 lg:hidden"
      >
        <span>До</span>
        <span className="text-lime-400">Після</span>
        <span className="absolute inset-x-[4.25rem] top-1/2 h-1 -translate-y-1/2 rounded-full bg-cream-50/25">
          <span className="absolute top-1/2 left-[var(--pos)] grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400 text-forest-950 shadow-cta">
            <Arrows />
          </span>
        </span>
      </div>

      {/* Десктоп: підказка, зникає після першого руху */}
      <span className="pointer-events-none absolute bottom-16 left-1/2 hidden -translate-x-1/2 rounded-full bg-forest-950/70 px-4 py-1.5 font-display text-xs font-semibold whitespace-nowrap text-cream-50 transition-opacity duration-500 group-data-[touched]/cmp:opacity-0 lg:block">
        ← Потягніть →
      </span>

      {/* Один нативний input: на телефоні лише над смужкою, на десктопі над усім фото */}
      <input
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        onChange={onInput}
        aria-label={`${label}: порівняння до і після`}
        className="absolute inset-x-[4.25rem] bottom-14 h-12 cursor-ew-resize opacity-0 [touch-action:pan-y] lg:inset-0 lg:h-auto lg:w-full"
      />
    </div>
  );
}

function Arrows() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
    </svg>
  );
}

function Single({ work, index }: { work: Work; index: number }) {
  const label = work.caption ?? `Робота ${work.id}`;
  return work.single ? (
    <img
      src={work.single}
      alt={label}
      loading="lazy"
      decoding="async"
      className={imgClass}
    />
  ) : (
    <Scene kind="after" seed={index + 1} />
  );
}

function WorkTile({ work, index }: { work: Work; index: number }) {
  return (
    <figure
      className={cn(
        'relative aspect-[4/5] shrink-0 basis-[80%] snap-center overflow-hidden rounded-[1.75rem] bg-forest-950 shadow-lift sm:basis-[46%] lg:aspect-auto lg:basis-auto',
        bento[index],
      )}
    >
      {work.kind === 'compare' ? (
        <Compare work={work} index={index} />
      ) : (
        <Single work={work} index={index} />
      )}

      {/* Підпис поверх фото: мітка категорії, номер, текст */}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-gradient-to-t from-forest-950/85 to-transparent px-4 pt-10 pb-3.5 text-cream-50">
        <span className="font-display text-sm font-bold text-lime-400 tabular-nums">
          {work.id.padStart(2, '0')}
        </span>
        {work.tag && (
          <span className="rounded-full bg-cream-50/15 px-2.5 py-0.5 font-display text-[0.6875rem] font-semibold">
            {work.tag}
          </span>
        )}
        {work.caption && (
          <span className="text-sm leading-snug">{work.caption}</span>
        )}
      </figcaption>
    </figure>
  );
}

export function Works() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="works"
        className="relative overflow-hidden bg-forest-900 py-16 text-cream-50 sm:py-20 lg:py-28"
      >
        {/* Смуги газону: статичний градієнт */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 88px, rgb(255 255 255 / 0.025) 88px 176px)',
          }}
        />

        <div className={cn(wrap, 'relative')}>
          <m.div {...reveal()}>
            <h2 className="text-h2 text-cream-50">
              Наші <span className="text-lime-400">роботи</span>
            </h2>
          </m.div>

          {/* Телефон: стрічка, яку гортають пальцем (native scroll-snap, без JS).
              Десктоп: мозаїка. */}
          <m.div
            {...reveal(0.1)}
            className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:mt-10 lg:grid lg:auto-rows-[16.5rem] lg:snap-none lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {works.map((work, index) => (
              <WorkTile key={work.id} work={work} index={index} />
            ))}
          </m.div>
          <p className="mt-1 text-center font-display text-xs font-semibold text-cream-50/50 lg:hidden">
            Гортайте →
          </p>
        </div>
      </section>
    </LazyMotion>
  );
}
