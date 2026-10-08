import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import {
  ArrowUpRightIcon,
  HandSwipeLeftIcon,
  QuotesIcon,
  StarIcon,
  UserIcon,
} from '@phosphor-icons/react';
import {
  MIN_CARDS,
  reviewLink,
  reviews,
  type Review,
} from '../../data/reviews';
import { cn } from '../../lib/cn';

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/* Як лежать картки в стопці: верхня рівно, нижні виглядають віялом */
const REST = [
  'translate3d(0,0,0) rotate(0deg)',
  'translate3d(0,16px,0) rotate(-3.5deg) scale(0.95)',
  'translate3d(0,32px,0) rotate(3deg) scale(0.9)',
];
const REST_HIDDEN = 'translate3d(0,32px,0) scale(0.9)';

/* Три кольори карток, щоб стопка виглядала живою */
const tones = [
  {
    card: 'bg-cream-50 text-ink-900',
    avatar: 'bg-forest-900 text-lime-400',
    star: 'text-forest-900',
    quote: 'text-lime-400/60',
    rule: 'border-forest-950/20',
    chip: 'bg-forest-950/10 text-forest-950',
  },
  {
    card: 'bg-forest-950 text-cream-50',
    avatar: 'bg-lime-400 text-forest-950',
    star: 'text-lime-400',
    quote: 'text-lime-400/15',
    rule: 'border-cream-50/20',
    chip: 'bg-cream-50/10 text-cream-50',
  },
  {
    card: 'bg-cream-100 text-ink-900',
    avatar: 'bg-forest-800 text-lime-300',
    star: 'text-forest-800',
    quote: 'text-forest-900/10',
    rule: 'border-forest-950/20',
    chip: 'bg-forest-950/10 text-forest-950',
  },
];

function Card({ review, index }: { review?: Review; index: number }) {
  const tone = tones[index % tones.length];
  const meta = review
    ? [review.service, review.place].filter(Boolean).join(' · ')
    : 'Послуга · Місто';

  return (
    <figure
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[1.75rem] p-6 sm:p-7',
        review
          ? cn(tone.card, 'shadow-lift')
          : 'border-2 border-dashed border-forest-950/35 bg-lime-400 text-forest-950/70',
      )}
    >
      <QuotesIcon
        aria-hidden
        weight="fill"
        className={cn(
          'pointer-events-none absolute -top-2 -right-2 size-28 rotate-6',
          review ? tone.quote : 'text-forest-950/10',
        )}
      />

      <figcaption className="relative flex items-center gap-3.5">
        <span
          aria-hidden
          className={cn(
            'grid size-14 shrink-0 place-items-center overflow-hidden rounded-full',
            review ? tone.avatar : 'bg-forest-950/10 text-forest-950/40',
          )}
        >
          {review?.avatar ? (
            <img
              src={review.avatar}
              alt=""
              loading="lazy"
              draggable={false}
              className="size-full object-cover"
            />
          ) : (
            <UserIcon weight="fill" className="size-7" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-base font-bold">
            {review ? review.name : "Ім'я клієнта"}
          </span>
          {review ? (
            <span
              className={cn('mt-1 flex gap-0.5', tone.star)}
              aria-label="5 з 5"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                  key={i}
                  aria-hidden
                  weight="fill"
                  className="size-4"
                />
              ))}
            </span>
          ) : (
            <span className="block text-sm opacity-70">Оцінка</span>
          )}
        </span>
      </figcaption>

      <blockquote className="relative mt-5 line-clamp-6 flex-1 text-[1.0625rem] leading-relaxed select-none sm:text-lg">
        {review ? review.text : 'Тут буде відгук вашого клієнта'}
      </blockquote>

      <div
        className={cn(
          'relative mt-5 flex items-center justify-between gap-3 border-t border-dashed pt-4 text-sm',
          review ? tone.rule : 'border-forest-950/25',
        )}
      >
        <span className="min-w-0 truncate opacity-70">{meta}</span>
        {review?.source && (
          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1 font-display text-xs font-semibold',
              tone.chip,
            )}
          >
            {review.source}
          </span>
        )}
      </div>
    </figure>
  );
}

/*
  Стопка карток. Верхню можна тягнути пальцем (або мишкою) в будь-який бік:
  відпустив далеко, і вона відлітає та лягає вниз стопки.
  Поки тягнеш, позицію пишемо прямо в DOM (без React-стану), тож жодних лагів.
*/
export function Reviews() {
  const count = Math.max(MIN_CARDS, reviews.length);
  const cards = Array.from({ length: count }, (_, i) => reviews[i]);

  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [touched, setTouched] = useState(false);
  const stack = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    dx: number;
    t: number;
    active: boolean;
  } | null>(null);
  const busy = useRef(false);

  const topCard = () =>
    stack.current?.querySelector<HTMLElement>('[data-pos="0"]') ?? null;

  const fly = (dir: 1 | -1) => {
    const card = topCard();
    if (!card || busy.current) return;
    busy.current = true;
    setTouched(true);
    card.style.transition = 'transform 0.3s ease-in';
    card.style.transform = `translate3d(${dir * window.innerWidth}px,0,0) rotate(${dir * 28}deg)`;
    window.setTimeout(() => {
      /* Без анімації переносимо картку вниз стопки, потім повертаємо плавність */
      card.style.transition = 'none';
      setOrder((o) => [...o.slice(1), o[0]]);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          card.style.transition = '';
          busy.current = false;
        }),
      );
    }, 290);
  };

  const back = () => {
    const card = topCard();
    if (!card) return;
    card.style.transition = '';
    card.style.transform = REST[0];
  };

  const onDown = (e: PointerEvent) => {
    if (busy.current) return;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      dx: 0,
      t: Date.now(),
      active: false,
    };
  };

  const onMove = (e: PointerEvent) => {
    const s = drag.current;
    const card = topCard();
    if (!s || !card) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.active) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
      s.active = true;
      stack.current?.setPointerCapture(e.pointerId);
      card.style.transition = 'none';
      setTouched(true);
    }
    s.dx = dx;
    card.style.transform = `translate3d(${dx}px,0,0) rotate(${dx / 16}deg)`;
  };

  const onUp = () => {
    const s = drag.current;
    drag.current = null;
    if (!s) return;
    const speed = Math.abs(s.dx) / Math.max(1, Date.now() - s.t);
    if (!s.active) fly(-1); /* тап по картці: наступна */
    else if (Math.abs(s.dx) > 70 || speed > 0.5) fly(s.dx > 0 ? 1 : -1);
    else back();
  };

  const onCancel = () => {
    drag.current = null;
    back();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') fly(1);
    else if (e.key === 'ArrowLeft') fly(-1);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="reviews"
        className="relative overflow-hidden bg-lime-400 py-16 text-forest-950 sm:py-20 lg:py-28"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-4 font-display text-[22rem] leading-none font-extrabold text-forest-950/[0.06] select-none lg:text-[30rem]"
        >
          “
        </span>

        <div
          className={cn(
            wrap,
            'relative grid gap-y-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-0',
          )}
        >
          <m.h2
            {...reveal()}
            className="text-h2 max-w-xl text-forest-950 lg:self-end lg:pb-6"
          >
            Відгуки
          </m.h2>

          {/* Стопка */}
          <m.div
            {...reveal(0.1)}
            className="lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            <div
              ref={stack}
              role="group"
              aria-roledescription="стопка відгуків"
              aria-label="Відгуки клієнтів. Свайпніть картку вліво або вправо"
              tabIndex={0}
              onKeyDown={onKey}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
              className="relative mx-auto h-[24.5rem] w-full max-w-md cursor-grab select-none active:cursor-grabbing sm:h-[26rem] lg:h-[28rem]"
            >
              {order.map((cardIndex, pos) => (
                <div
                  key={cardIndex}
                  data-pos={pos}
                  className={cn(
                    'absolute inset-x-0 top-0 bottom-9 transition-[transform] duration-300 ease-out [touch-action:pan-y] will-change-transform',
                    pos > 2 && 'pointer-events-none opacity-0',
                    pos === 0 &&
                      !touched &&
                      'animate-[nudge_1s_ease-in-out_1.6s_1]',
                  )}
                  style={{
                    transform: REST[pos] ?? REST_HIDDEN,
                    zIndex: count - pos,
                  }}
                >
                  <Card review={cards[cardIndex]} index={cardIndex} />
                </div>
              ))}
            </div>
          </m.div>

          <m.p
            {...reveal(0.15)}
            className="flex items-center gap-3 font-display text-sm font-semibold lg:self-start"
          >
            <span className="grid size-11 place-items-center rounded-full bg-forest-950 text-lime-400">
              <HandSwipeLeftIcon aria-hidden weight="bold" className="size-6" />
            </span>
            <span>
              Свайпайте картки
              <span className="ml-3 tabular-nums opacity-60" aria-live="polite">
                {String(order[0] + 1).padStart(2, '0')} /{' '}
                {String(count).padStart(2, '0')}
              </span>
            </span>
          </m.p>

          {/* Запрошення залишити відгук: зорі «запалюються» по черзі */}
          <m.a
            {...reveal(0.15)}
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-[1.75rem] bg-forest-950 p-5 text-cream-50 shadow-lift transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98] sm:p-7 lg:col-span-2 lg:mt-12"
          >
            <span className="min-w-0">
              <span className="flex gap-1" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    weight="fill"
                    style={{ transitionDelay: `${i * 70}ms` }}
                    className="size-6 text-cream-50/25 transition-colors duration-300 group-hover:text-lime-400 group-active:text-lime-400 sm:size-7"
                  />
                ))}
              </span>
              <span className="mt-3 block font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                Залишити відгук
              </span>
              <span className="mt-1 block text-sm text-cream-100/70">
                Нам важлива ваша оцінка
              </span>
            </span>
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-lime-400 text-forest-950 transition-transform duration-300 group-hover:rotate-45 sm:size-16">
              <ArrowUpRightIcon aria-hidden weight="bold" className="size-7" />
            </span>
          </m.a>
        </div>
      </section>
    </LazyMotion>
  );
}
