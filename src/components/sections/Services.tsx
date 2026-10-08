import {
  memo,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { domAnimation, LazyMotion, m, useInView } from 'motion/react';
import {
  BroomIcon,
  CalendarCheckIcon,
  CheckCircleIcon,
  InfoIcon,
  LeafIcon,
  PlantIcon,
  type Icon,
} from '@phosphor-icons/react';
import {
  MIN_VISIT_PRICE,
  priceNote,
  serviceGroups,
  type IconName,
} from '../../data/services';
import { cn } from '../../lib/cn';

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

const icons: Record<IconName, Icon> = {
  plant: PlantIcon,
  grass: LeafIcon,
  broom: BroomIcon,
  calendar: CalendarCheckIcon,
};

const money = (value: number) => value.toLocaleString('uk-UA');

const EASE = [0.22, 1, 0.36, 1] as const;

/* Одно мягкое появление блока: только opacity + небольшой сдвиг */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.8, delay, ease: EASE },
});

/* Слово плавно выезжает из-под маски: только transform */
function Word({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <m.span
        className={cn('inline-block', className)}
        initial={{ y: '105%' }}
        whileInView={{ y: '0%' }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, delay: 0.05 + index * 0.1, ease: EASE }}
      >
        {children}
      </m.span>
    </span>
  );
}

/* Число «набегает». Пишем прямо в DOM, без setState: React не перерисовывает секцию 60 раз в секунду */
const CountUp = memo(function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const output = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    const out = output.current;
    if (!inView || !out) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      out.textContent = money(to);
      return;
    }
    let frame = 0;
    const start = performance.now() + 300;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 1400));
      out.textContent = money(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref} className="relative inline-block tabular-nums">
      {/* невидимое итоговое число держит ширину */}
      <span className="invisible">{money(to)}</span>
      <span ref={output} aria-hidden className="absolute inset-0 text-right">
        0
      </span>
    </span>
  );
});

export function Services() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const group = serviceGroups[active];
  const GroupIcon = icons[group.icon];

  const onKeyDown = (event: KeyboardEvent) => {
    const last = serviceGroups.length - 1;
    let next = active;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = active === last ? 0 : active + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = active === 0 ? last : active - 1;
    } else return;
    event.preventDefault();
    setActive(next);
    tabsRef.current
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="services"
        className="relative overflow-hidden bg-forest-900 py-16 text-cream-50 sm:py-20 lg:py-28"
      >
        {/* Смуги газону на фоні: статичний градієнт, без навантаження на GPU */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0 88px, rgb(255 255 255 / 0.025) 88px 176px)',
          }}
        />
        {/* Свечение в углу: готовый градиент вместо blur, на телефонах blur тяжёлый */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 size-[26rem]"
          style={{
            backgroundImage:
              'radial-gradient(closest-side, rgb(185 224 74 / 0.22), transparent)',
          }}
        />

        <div className={cn(wrap, 'relative')}>
          {/* Заголовок + мінімальний виїзд */}
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
            <h2 className="text-h2 max-w-2xl text-cream-50">
              <Word index={0}>Послуги</Word> <Word index={1}>та</Word>{' '}
              <Word index={2} className="text-lime-400">
                вартість
              </Word>
            </h2>

            <m.div
              {...fadeUp(0.1)}
              className="lg:text-right"
              aria-label={`Мінімальна вартість виїзду на об'єкт від ${money(MIN_VISIT_PRICE)} гривень`}
            >
              <p className="font-display text-sm font-semibold text-cream-100/80">
                Мінімальна вартість виїзду на об'єкт
              </p>
              <p className="mt-2 flex items-baseline gap-2 text-lime-400 lg:justify-end">
                <span className="font-display text-base font-semibold">
                  від
                </span>
                <span className="font-display text-[3.5rem] leading-[0.85] font-extrabold tracking-tighter sm:text-[5rem]">
                  <CountUp to={MIN_VISIT_PRICE} />
                </span>
                <span className="font-display text-base font-semibold">
                  грн
                </span>
              </p>
            </m.div>
          </div>

          {/* Вкладки + панель: один общий блок, одно появление */}
          <m.div
            {...fadeUp()}
            className="mt-10 grid gap-4 lg:grid-cols-[19rem_1fr] lg:gap-6"
          >
            {/* Телефон: сетка 2×2, все четыре вкладки видны сразу, большие зоны нажатия */}
            <div
              ref={tabsRef}
              role="tablist"
              aria-label="Категорії послуг"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="grid grid-cols-2 gap-2.5 lg:flex lg:flex-col lg:gap-3"
            >
              {serviceGroups.map((item, index) => {
                const selected = index === active;
                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="services-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(index)}
                    className={cn(
                      'flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-display text-sm font-semibold transition-[background-color,color,border-color,scale] duration-200 active:scale-[0.97]',
                      'lg:items-start lg:rounded-3xl lg:px-5 lg:py-4',
                      selected
                        ? 'border-lime-400 bg-lime-400 text-forest-950'
                        : 'border-cream-50/20 text-cream-50 hover:border-cream-50/50',
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs tabular-nums lg:pt-0.5',
                        selected ? 'text-forest-700' : 'text-cream-50/50',
                      )}
                    >
                      0{index + 1}
                    </span>
                    <span className="lg:hidden">{item.short}</span>
                    <span className="hidden leading-snug lg:block">
                      {item.title}
                      {item.subtitle && (
                        <span className="mt-0.5 block text-xs font-medium opacity-70">
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              id="services-panel"
              role="tabpanel"
              aria-labelledby={`tab-${group.id}`}
              className="rounded-leaf relative overflow-hidden bg-cream-50 p-5 text-ink-900 shadow-lift sm:p-9"
            >
              {/* Водяний знак з номером категорії */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-4 right-4 font-display text-[8rem] leading-none font-extrabold text-forest-900/[0.06] select-none sm:text-[10rem]"
              >
                {active + 1}
              </span>

              {/* При смене вкладки весь контент один раз мягко проявляется (CSS, без JS-анимаций) */}
              <div
                key={group.id}
                className="relative animate-[fade-up_0.4s_ease-out_both]"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-lime-400 text-forest-950">
                  <GroupIcon aria-hidden weight="bold" className="size-6" />
                </span>
                <h3 className="mt-5 max-w-md text-xl font-bold sm:text-2xl">
                  {group.title}
                </h3>
                {group.subtitle && (
                  <p className="mt-1 font-display text-sm font-semibold text-forest-600">
                    {group.subtitle}
                  </p>
                )}

                <ul className="mt-4">
                  {group.items.map((row) => (
                    <li
                      key={row.name}
                      className="flex flex-col gap-1.5 border-b border-dashed border-forest-900/15 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    >
                      <div>
                        <p className="font-medium text-ink-900">{row.name}</p>
                        {row.note && (
                          <p className="mt-0.5 text-sm text-ink-500">
                            {row.note}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 whitespace-nowrap sm:text-right">
                        {row.price ? (
                          <>
                            {row.from && (
                              <span className="mr-1 text-sm text-ink-500">
                                від
                              </span>
                            )}
                            <span className="font-display text-xl font-bold text-forest-900">
                              {money(row.price)}
                            </span>
                            <span className="ml-1 text-sm text-ink-500">
                              грн / {row.unit}
                            </span>
                          </>
                        ) : (
                          <span className="inline-block rounded-full bg-clay-500/12 px-3 py-1 font-display text-xs font-semibold text-clay-500">
                            Індивідуально
                          </span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>

                {group.includes && (
                  <div className="mt-3 rounded-2xl bg-forest-900 p-5 text-cream-50">
                    <p className="font-display text-xs font-semibold tracking-widest text-lime-400 uppercase">
                      Включає
                    </p>
                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {group.includes.map((text) => (
                        <li key={text} className="flex items-center gap-2.5">
                          <CheckCircleIcon
                            aria-hidden
                            weight="fill"
                            className="size-5 shrink-0 text-lime-400"
                          />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </m.div>

          <m.p
            {...fadeUp()}
            className="mt-6 flex items-start gap-2.5 rounded-2xl bg-lime-400/15 p-4 text-sm text-lime-200"
          >
            <InfoIcon
              aria-hidden
              weight="bold"
              className="mt-0.5 size-4 shrink-0"
            />
            {priceNote}
          </m.p>
        </div>
      </section>
    </LazyMotion>
  );
}
