import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react';
import { compare, gallery } from '../../data/works';
import { cn } from '../../lib/cn';

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/* ==========================================================================
   До / після. Один нативний range-input поверх фото: браузер сам ловить
   дотик, вертикальна прокрутка сторінки працює. Позицію пишемо в CSS-змінну
   прямо в DOM, без React-стану, тому на телефоні не лагає.
   ========================================================================== */
function Compare({ before, after }: { before: string; after: string }) {
  const box = useRef<HTMLDivElement>(null);

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const el = box.current;
    if (!el) return;
    el.style.setProperty('--pos', `${e.target.value}%`);
    el.dataset.touched = '1';
  };

  return (
    <div
      ref={box}
      className="group/cmp rounded-leaf relative aspect-[4/3] overflow-hidden bg-forest-950 shadow-lift [--pos:50%] select-none sm:aspect-[16/10] lg:aspect-[16/9]"
    >
      <img
        src={after}
        alt="Після роботи"
        draggable={false}
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <img
        src={before}
        alt="До роботи"
        draggable={false}
        decoding="async"
        className="absolute inset-0 size-full object-cover [clip-path:inset(0_calc(100%-var(--pos))_0_0)]"
      />

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-forest-950/75 px-3.5 py-1.5 font-display text-xs font-semibold text-cream-50 sm:top-5 sm:left-5 sm:text-sm">
        До
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-lime-400 px-3.5 py-1.5 font-display text-xs font-semibold text-forest-950 sm:top-5 sm:right-5 sm:text-sm">
        Після
      </span>

      {/* Лінія і ручка */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[var(--pos)] w-0.5 -translate-x-1/2 bg-cream-50 shadow-[0_0_0_1px_rgb(17_38_26/0.3)]"
      >
        <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-lime-400 text-forest-950 shadow-cta sm:size-14">
          <ArrowLeftIcon aria-hidden weight="bold" className="size-4" />
          <ArrowRightIcon aria-hidden weight="bold" className="size-4" />
        </span>
      </div>

      {/* Підказка зникає після першого руху */}
      <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-forest-950/75 px-4 py-2 font-display text-xs font-semibold whitespace-nowrap text-cream-50 transition-opacity duration-500 group-data-[touched]/cmp:opacity-0 sm:text-sm">
        Потягніть повзунок
      </span>

      <input
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        onChange={onInput}
        aria-label="Порівняння до і після"
        className="absolute inset-0 size-full cursor-ew-resize opacity-0 [touch-action:pan-y]"
      />
    </div>
  );
}

/* ==========================================================================
   Перегляд фото на весь екран. Нативний <dialog> (фокус і Esc з коробки),
   всередині стрічка зі scroll-snap: на телефоні гортається пальцем, без JS.
   ========================================================================== */
function Lightbox({ start, onClose }: { start: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const d = dialog.current;
    const s = strip.current;
    if (!d || !s) return;
    d.showModal();
    s.scrollLeft = start * s.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [start]);

  const onScroll = () => {
    const s = strip.current;
    if (!s || !counter.current) return;
    const i = Math.round(s.scrollLeft / s.clientWidth);
    counter.current.textContent = `${i + 1} / ${gallery.length}`;
  };

  const go = (dir: 1 | -1) => {
    const s = strip.current;
    if (s) s.scrollBy({ left: dir * s.clientWidth, behavior: 'smooth' });
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-label="Фото робіт"
      className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-forest-950 p-0 text-cream-50 backdrop:bg-transparent"
    >
      <div
        ref={strip}
        onScroll={onScroll}
        className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {gallery.map((src, i) => (
          <div
            key={src}
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className="grid size-full shrink-0 snap-center place-items-center px-3 py-16 sm:px-16"
          >
            <img
              src={src}
              alt={`Робота ${i + 1}`}
              decoding="async"
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
          </div>
        ))}
      </div>

      <span
        ref={counter}
        className="pointer-events-none absolute top-5 left-5 rounded-full bg-cream-50/10 px-4 py-2 font-display text-sm font-semibold tabular-nums"
      >
        {start + 1} / {gallery.length}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="absolute top-3 right-3 grid size-12 place-items-center rounded-full bg-lime-400 text-forest-950 shadow-cta transition-transform active:scale-90"
      >
        <XIcon aria-hidden weight="bold" className="size-5" />
      </button>

      {/* Стрілки лише там, де є мишка */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Попереднє фото"
        className="absolute top-1/2 left-4 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-cream-50/15 transition-colors hover:bg-lime-400 hover:text-forest-950 pointer-fine:grid"
      >
        <ArrowLeftIcon aria-hidden weight="bold" className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Наступне фото"
        className="absolute top-1/2 right-4 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-cream-50/15 transition-colors hover:bg-lime-400 hover:text-forest-950 pointer-fine:grid"
      >
        <ArrowRightIcon aria-hidden weight="bold" className="size-5" />
      </button>
    </dialog>
  );
}

/* ==========================================================================
   Галерея: звичайна сітка однакових плиток. Тап/клік відкриває фото на весь екран.
   2 колонки на телефоні, 5 на десктопі: для 10 фото рядки виходять рівними.
   ========================================================================== */
function Gallery({ onOpen }: { onOpen: (i: number) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5">
      {gallery.map((src, i) => (
        <li key={src}>
          <button
            type="button"
            onClick={() => onOpen(i)}
            aria-label={`Відкрити фото ${i + 1}`}
            className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-forest-800 sm:rounded-3xl"
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-active:scale-100"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-forest-950/0 transition-colors duration-300 group-hover:bg-forest-950/20"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Works() {
  const [open, setOpen] = useState<number | null>(null);

  if (!compare && gallery.length === 0) return null;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="works"
        className="relative overflow-hidden bg-forest-900 py-16 text-cream-50 sm:py-20 lg:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 88px, rgb(255 255 255 / 0.025) 88px 176px)',
          }}
        />

        <div className={cn(wrap, 'relative')}>
          <m.h2 {...reveal()} className="text-h2 text-cream-50">
            Наші <span className="text-lime-400">роботи</span>
          </m.h2>

          {compare && (
            <m.div {...reveal(0.1)} className="mt-8 lg:mt-12">
              <Compare before={compare.before} after={compare.after} />
            </m.div>
          )}

          {gallery.length > 0 && (
            <m.div
              {...reveal(0.1)}
              className={compare ? 'mt-3 sm:mt-4' : 'mt-8 lg:mt-12'}
            >
              <Gallery onOpen={setOpen} />
            </m.div>
          )}
        </div>

        {open !== null && (
          <Lightbox start={open} onClose={() => setOpen(null)} />
        )}
      </section>
    </LazyMotion>
  );
}
