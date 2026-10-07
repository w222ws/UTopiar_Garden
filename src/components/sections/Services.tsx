import {
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const EASE = [0.22, 1, 0.36, 1] as const;

/* Появление строки внутри панели: на каждую смену вкладки запускается заново */
const rowIn = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: EASE },
});

/* Слово «выезжает» из-под маски: двигается только transform */
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
        initial={{ y: '110%', rotate: 4 }}
        whileInView={{ y: '0%', rotate: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, delay: 0.08 + index * 0.1, ease: EASE }}
      >
        {children}
      </m.span>
    </span>
  );
}

/* Число «набегает» до значения, когда блок появился на экране */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }
    let frame = 0;
    const start = performance.now() + 350; // небольшая пауза после появления
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 1300));
      setValue(Math.round(to * (1 - Math.pow(1 - t, 4))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref} className="relative inline-block tabular-nums">
      {/* невидимое итоговое число держит ширину, чтобы ничего не прыгало */}
      <span className="invisible">{money(to)}</span>
      <span aria-hidden className="absolute inset-0 text-right">
        {money(value)}
      </span>
    </span>
  );
}

export function Services() {
  const [active, setActive] = useState(0);
  // Первое появление идёт с паузой (ждём панель), при смене вкладки без неё
  const [touched, setTouched] = useState(false);
  const base = touched ? 0 : 0.4;
  const tabsRef = useRef<HTMLDivElement>(null);
  const group = serviceGroups[active];
  const GroupIcon = icons[group.icon];

  const tabs = () =>
    tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');

  const select = (index: number) => {
    setActive(index);
    setTouched(true);
    // На телефоні вибрана вкладка центрується у смузі.
    // Скролимо лише саму смугу (scrollIntoView зсунув би і сторінку).
    const list = tabsRef.current;
    const tab = tabs()?.[index];
    if (list && tab && list.scrollWidth > list.clientWidth) {
      list.scrollTo({
        left: tab.offsetLeft - (list.clientWidth - tab.clientWidth) / 2,
        behavior: 'smooth',
      });
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const last = serviceGroups.length - 1;
    let next = active;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      next = active === last ? 0 : active + 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      next = active === 0 ? last : active - 1;
    } else return;
    event.preventDefault();
    select(next);
    tabs()?.[next]?.focus();
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
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full bg-lime-400/15 blur-3xl"
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

          {/* Вкладки + панель */}
          <div className="mt-10 grid gap-4 lg:grid-cols-[19rem_1fr] lg:gap-6">
            <div
              ref={tabsRef}
              role="tablist"
              aria-label="Категорії послуг"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="relative -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
            >
              {serviceGroups.map((item, index) => {
                const selected = index === active;
                return (
                  <m.button
                    key={item.id}
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + index * 0.08,
                      ease: EASE,
                    }}
                    id={`tab-${item.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="services-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => select(index)}
                    className={cn(
                      'flex shrink-0 snap-start items-center gap-3 rounded-full border-2 px-4 py-2.5 text-left font-display text-sm font-semibold whitespace-nowrap transition-[background-color,color,border-color,translate] duration-200 active:scale-[0.98]',
                      'lg:items-start lg:rounded-3xl lg:px-5 lg:py-4 lg:whitespace-normal',
                      selected
                        ? 'border-lime-400 bg-lime-400 text-forest-950'
                        : 'border-cream-50/20 text-cream-50 hover:border-cream-50/50 lg:hover:translate-x-1',
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
                  </m.button>
                );
              })}
            </div>

            <m.div
              id="services-panel"
              role="tabpanel"
              aria-labelledby={`tab-${group.id}`}
              initial={{ opacity: 0, y: 56, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
              style={{ transformOrigin: '50% 100%' }}
              className="rounded-leaf relative overflow-hidden bg-cream-50 p-5 text-ink-900 shadow-lift sm:p-9"
            >
              {/* Водяний знак з номером категорії */}
              <span
                aria-hidden
                key={`n-${group.id}`}
                className="pointer-events-none absolute -top-4 right-4 animate-fade-up font-display text-[8rem] leading-none font-extrabold text-forest-900/[0.06] select-none sm:text-[10rem]"
              >
                {active + 1}
              </span>

              {/* key: при зміні вкладки вміст з'являється заново */}
              <div key={group.id} className="relative">
                <m.span
                  initial={{ opacity: 0, scale: 0.4, rotate: -25 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: base + 0.05,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="grid size-12 place-items-center rounded-2xl bg-lime-400 text-forest-950"
                >
                  <GroupIcon aria-hidden weight="bold" className="size-6" />
                </m.span>
                <m.div {...rowIn(base + 0.1)}>
                  <h3 className="mt-5 max-w-md text-xl font-bold sm:text-2xl">
                    {group.title}
                  </h3>
                  {group.subtitle && (
                    <p className="mt-1 font-display text-sm font-semibold text-forest-600">
                      {group.subtitle}
                    </p>
                  )}
                </m.div>

                <ul className="mt-4">
                  {group.items.map((row, rowIndex) => (
                    <m.li
                      key={row.name}
                      {...rowIn(base + 0.2 + rowIndex * 0.07)}
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
                    </m.li>
                  ))}
                </ul>

                {group.includes && (
                  <m.div
                    {...rowIn(base + 0.2 + group.items.length * 0.07)}
                    className="mt-3 rounded-2xl bg-forest-900 p-5 text-cream-50"
                  >
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
                  </m.div>
                )}
              </div>
            </m.div>
          </div>

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
