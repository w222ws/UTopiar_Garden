import { useEffect, useRef, useState } from 'react';
import { domAnimation, LazyMotion, m, useInView } from 'motion/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { FaTelegram, FaViber, FaWhatsapp } from 'react-icons/fa6';
import { contacts } from '../../data/site';
import { cn } from '../../lib/cn';

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
const EASE = [0.22, 1, 0.36, 1] as const;
const POP = [0.34, 1.56, 0.64, 1] as const;

const ctaButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-display text-sm font-semibold transition-[translate,scale,background-color] duration-200 hover:-translate-y-0.5 active:scale-[0.97]';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, delay, ease: EASE },
});

/* Тексти: тільки з опису послуг */
const online = {
  title: 'Онлайн-оцінка за 15 хвилин',
  badge: 'Безкоштовно',
  steps: [
    'Надішліть коротке відео або кілька фото вашої ділянки у Viber / Telegram / WhatsApp',
    'Ми орієнтовно прорахуємо вартість робіт',
    'Відповімо на всі питання',
  ],
};

const visit = {
  title: "Виїзд майстра на об'єкт",
  steps: [
    'Замовте виїзд фахівця безпосередньо на ділянку',
    'Точні заміри та оцінка стану рослин',
    'Професійна консультація',
    'Складання детального кошторису',
  ],
  note: 'Вартість виїзду для консультації та оцінки узгоджується індивідуально і зараховується у вартість робіт при замовленні послуг.',
};

/* ==========================================================================
   Сцена 1: чат. Клієнт кидає фото й відео, ми рахуємо за 15 хвилин, відповідаємо.
   Усе намальовано CSS, без картинок.
   ========================================================================== */
function Bubble({
  show,
  delay = 0,
  mine,
  children,
}: {
  show: boolean;
  delay?: number;
  mine?: boolean;
  children: React.ReactNode;
}) {
  return (
    <m.div
      initial={false}
      animate={
        show
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 18, scale: 0.85 }
      }
      transition={{ duration: 0.5, delay, ease: POP }}
      style={{ transformOrigin: mine ? '100% 100%' : '0% 100%' }}
      className={cn(
        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.8125rem] leading-snug',
        mine
          ? 'self-end rounded-br-md bg-lime-400 text-forest-950'
          : 'self-start rounded-bl-md border border-forest-900/10 bg-white text-ink-900',
      )}
    >
      {children}
    </m.div>
  );
}

function ChatScene({ stage }: { stage: number }) {
  return (
    <div className="mx-auto w-full max-w-[15rem] rounded-[2.25rem] sm:max-w-[17.5rem] bg-forest-950 p-2 shadow-lift ring-1 ring-cream-50/15">
      <div className="relative h-[20rem] overflow-hidden rounded-[1.75rem] bg-cream-100">
        {/* Шапка чату */}
        <div className="flex items-center gap-2.5 border-b border-forest-900/10 bg-cream-50 px-4 py-3">
          <span className="grid size-8 place-items-center rounded-full bg-forest-900 font-display text-xs font-bold text-lime-400">
            U
          </span>
          <div className="leading-tight">
            <p className="font-display text-xs font-bold text-forest-900">
              UTopiar Garden
            </p>
            <p className="flex items-center gap-1 text-[0.6875rem] text-ink-500">
              <span className="size-1.5 rounded-full bg-lime-500" />
              online
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 p-3">
          {/* 1. Клієнт: фото й відео ділянки */}
          <Bubble show={stage >= 1} mine>
            <div className="grid w-36 grid-cols-3 sm:w-44 gap-1.5">
              <span className="aspect-square rounded-lg bg-[radial-gradient(120%_70%_at_30%_110%,#356648_55%,transparent_56%),linear-gradient(#cdec74,#9cc933)]" />
              <span className="aspect-square rounded-lg bg-[radial-gradient(100%_60%_at_80%_110%,#46805c_55%,transparent_56%),linear-gradient(#e0f5a6,#b9e04a)]" />
              <span className="relative grid aspect-square place-items-center rounded-lg bg-forest-900">
                {/* трикутник «play» */}
                <span className="ml-0.5 size-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-lime-400" />
                <span className="absolute right-1 bottom-0.5 text-[0.5625rem] font-semibold text-cream-50">
                  0:12
                </span>
              </span>
            </div>
          </Bubble>

          {/* Набір тексту, потім відповідь із таймером */}
          <div className="relative">
            <m.div
              initial={false}
              animate={{ opacity: stage === 2 ? [0, 1, 1, 0] : 0 }}
              transition={{ duration: 1.1, times: [0, 0.15, 0.8, 1] }}
              className="absolute top-0 left-0 flex gap-1 rounded-2xl rounded-bl-md border border-forest-900/10 bg-white px-3.5 py-3"
              aria-hidden
            >
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 animate-bounce rounded-full bg-ink-300"
                  style={{ animationDelay: `${dot * 120}ms` }}
                />
              ))}
            </m.div>

            <Bubble show={stage >= 2} delay={stage === 2 ? 1.1 : 0}>
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 44 44"
                  className="size-11 shrink-0"
                  aria-hidden
                >
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="#e3eee6"
                    strokeWidth="5"
                  />
                  <m.circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="#46805c"
                    strokeWidth="5"
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                    initial={false}
                    animate={{ pathLength: stage >= 2 ? 1 : 0 }}
                    transition={{
                      duration: 1.4,
                      delay: stage === 2 ? 1.3 : 0,
                      ease: EASE,
                    }}
                  />
                  <text
                    x="22"
                    y="26"
                    textAnchor="middle"
                    className="fill-forest-900 font-display text-[11px] font-bold"
                  >
                    15
                  </text>
                </svg>
                <span>
                  <b className="font-display text-forest-900">15 хвилин</b>
                  <br />
                  орієнтовний прорахунок
                </span>
              </div>
            </Bubble>
          </div>

          {/* 3. Відповідь на питання */}
          <Bubble show={stage >= 3}>Відповімо на всі питання</Bubble>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Сцена 2: план ділянки. Виїзд, заміри, консультація, кошторис. Усе SVG.
   ========================================================================== */
function PlotScene({ stage }: { stage: number }) {
  const trees = [
    { x: 92, y: 118, r: 20 },
    { x: 150, y: 168, r: 13 },
    { x: 276, y: 112, r: 22 },
  ];
  return (
    <svg
      viewBox="0 0 360 250"
      role="img"
      aria-label="План ділянки: виїзд, заміри, консультація та кошторис"
      className="mx-auto block h-auto w-full max-w-[28rem]"
    >
      {/* Ділянка: контур малюється лінією */}
      <m.path
        d="M26 74 L150 50 L332 66 L340 196 L190 220 L38 202 Z"
        fill="#e3eee6"
        stroke="#356648"
        strokeWidth="2.5"
        strokeLinejoin="round"
        initial={false}
        animate={{
          pathLength: stage >= 1 ? 1 : 0,
          fillOpacity: stage >= 1 ? 1 : 0,
        }}
        transition={{
          pathLength: { duration: 1.2, ease: EASE },
          fillOpacity: { duration: 0.6, delay: 0.9 },
        }}
      />
      {/* Газон і живопліт */}
      <m.g
        initial={false}
        animate={{ opacity: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <path
          d="M46 160 L130 148 L132 196 L50 192 Z"
          fill="#cdec74"
          opacity="0.7"
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={180 + i * 15}
            cy={66 + i * 1.6}
            r="7"
            fill="#285038"
          />
        ))}
        <rect
          x="204"
          y="118"
          width="46"
          height="34"
          rx="4"
          fill="#ddd6c0"
          stroke="#a3ada6"
        />
      </m.g>

      {/* Рослини */}
      {trees.map((t, i) => (
        <m.g
          key={i}
          initial={false}
          animate={{ scale: stage >= 1 ? 1 : 0, opacity: stage >= 1 ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1 + i * 0.12, ease: POP }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx={t.x} cy={t.y} r={t.r} fill="#46805c" />
          <circle
            cx={t.x - t.r * 0.25}
            cy={t.y - t.r * 0.25}
            r={t.r * 0.55}
            fill="#5f9b75"
          />
        </m.g>
      ))}

      {/* 1. Виїзд: мітка падає на ділянку */}
      <m.g
        initial={false}
        animate={{ y: stage >= 1 ? 0 : -60, opacity: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 0.7, delay: 1.2, ease: POP }}
      >
        <circle cx="190" cy="176" r="16" fill="#b9e04a" opacity="0.35" />
        <circle
          cx="190"
          cy="176"
          r="8"
          fill="#b9e04a"
          stroke="#11261a"
          strokeWidth="2.5"
        />
      </m.g>

      {/* 2. Заміри: розмірні лінії + кільця на рослинах */}
      <m.path
        d="M26 232 L340 232 M26 226 L26 238 M340 226 L340 238 M12 74 L12 202 M6 74 L18 74 M6 202 L18 202"
        fill="none"
        stroke="#c8763a"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{
          pathLength: stage >= 2 ? 1 : 0,
          opacity: stage >= 2 ? 1 : 0,
        }}
        transition={{ duration: 1, ease: EASE }}
      />
      {trees.map((t, i) => (
        <m.circle
          key={`ring-${i}`}
          cx={t.x}
          cy={t.y}
          r={t.r + 9}
          fill="none"
          stroke="#9cc933"
          strokeWidth="2.5"
          strokeDasharray="5 5"
          initial={false}
          animate={{ opacity: stage >= 2 ? 1 : 0, scale: stage >= 2 ? 1 : 0.5 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: POP }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      ))}

      {/* 3. Консультація: виноска до рослини */}
      <m.g
        initial={false}
        animate={{
          opacity: stage >= 3 ? 1 : 0,
          y: stage >= 3 ? 0 : 12,
          scale: stage >= 3 ? 1 : 0.85,
        }}
        transition={{ duration: 0.55, ease: POP }}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
      >
        <path
          d="M262 40 L276 84"
          stroke="#11261a"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <rect x="204" y="4" width="136" height="40" rx="12" fill="#1f3d2b" />
        <rect x="216" y="15" width="84" height="5" rx="2.5" fill="#b9e04a" />
        <rect
          x="216"
          y="27"
          width="56"
          height="5"
          rx="2.5"
          fill="#e3eee6"
          opacity="0.6"
        />
        <circle cx="320" cy="24" r="8" fill="#b9e04a" />
        <path
          d="M316 24 L319 27 L324 21"
          fill="none"
          stroke="#11261a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </m.g>

      {/* 4. Кошторис: аркуш виїжджає справа */}
      <m.g
        initial={false}
        animate={{
          opacity: stage >= 4 ? 1 : 0,
          x: stage >= 4 ? 0 : 60,
          rotate: stage >= 4 ? 3 : 10,
        }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
      >
        <rect
          x="236"
          y="132"
          width="112"
          height="108"
          rx="10"
          fill="#fbf9f3"
          stroke="#1f3d2b"
          strokeWidth="2.5"
        />
        <rect x="248" y="144" width="52" height="8" rx="4" fill="#1f3d2b" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect
              x="248"
              y={162 + i * 14}
              width="56"
              height="5"
              rx="2.5"
              fill="#a3ada6"
              opacity="0.7"
            />
            <rect
              x="312"
              y={162 + i * 14}
              width="26"
              height="5"
              rx="2.5"
              fill="#46805c"
            />
          </g>
        ))}
        <rect x="248" y="212" width="90" height="16" rx="8" fill="#b9e04a" />
      </m.g>
    </svg>
  );
}

const methods = [
  { id: 'online', label: 'Спосіб 1', ...online },
  { id: 'visit', label: 'Спосіб 2', ...visit, badge: undefined },
] as const;

const messengers = [
  {
    Icon: FaTelegram,
    color: '#229ED9',
    pos: 'left-0 top-8 sm:left-6',
    delay: 0,
  },
  {
    Icon: FaViber,
    color: '#7360F2',
    pos: 'right-0 top-28 sm:right-6',
    delay: 0.12,
  },
  {
    Icon: FaWhatsapp,
    color: '#25D366',
    pos: 'bottom-10 left-0 sm:left-6',
    delay: 0.24,
  },
];

export function HowItWorks() {
  const [method, setMethod] = useState(0);
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(true);
  // Автоплей тільки на десктопі: на телефоні нічого не рухається без дотику
  const [isDesktop, setIsDesktop] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef(0);
  // Без once: коли блок поза екраном, автоплей стоїть
  const inView = useInView(ref, { margin: '-120px' });
  const current = methods[method];
  const count = current.steps.length;

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Сцена стартує зі stage 0, потім переходить на 1: тоді все програється з початку
  useEffect(() => {
    if (!inView || stage !== 0) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      setAuto(false);
      setStage(count);
      return;
    }
    const t = window.setTimeout(() => setStage(1), 450);
    return () => window.clearTimeout(t);
  }, [inView, stage, count]);

  // Автоплей: кроки йдуть по черзі, після останнього показуємо другий спосіб.
  // Будь-який клік користувача вимикає автоплей.
  useEffect(() => {
    if (!inView || !auto || !isDesktop || stage === 0) return;
    const t = window.setTimeout(
      () => {
        if (stage < count) {
          setStage(stage + 1);
        } else {
          setMethod((value) => (value + 1) % methods.length);
          setStage(0);
        }
      },
      stage >= count ? 4200 : 2200,
    );
    return () => window.clearTimeout(t);
  }, [inView, auto, isDesktop, stage, count]);

  const chooseMethod = (index: number) => {
    if (index === method) return;
    setAuto(false);
    setMethod(index);
    setStage(0);
  };

  const chooseStep = (index: number) => {
    setAuto(false);
    setStage(index + 1);
  };

  /* Телефон: свайп карток кроків (native scroll-snap), сцена слідкує за видимою карткою */
  const goTo = (index: number) => {
    const el = scrollerRef.current;
    const target = Math.min(count - 1, Math.max(0, index));
    setAuto(false);
    setStage(target + 1);
    const card = el?.children[target] as HTMLElement | undefined;
    const first = el?.children[0] as HTMLElement | undefined;
    if (el && card && first) {
      el.scrollTo({
        left: card.offsetLeft - first.offsetLeft,
        behavior: 'smooth',
      });
    }
  };

  const onScroll = () => {
    if (scrollFrame.current) return;
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = 0;
      const el = scrollerRef.current;
      if (!el) return;
      const first = el.children[0] as HTMLElement | undefined;
      const second = el.children[1] as HTMLElement | undefined;
      const step = first && second ? second.offsetLeft - first.offsetLeft : 1;
      const index = Math.min(
        count - 1,
        Math.max(0, Math.round(el.scrollLeft / step)),
      );
      // stage 0 — це «перезапуск сцени», його не чіпаємо
      setStage((prev) => (prev === 0 || prev === index + 1 ? prev : index + 1));
    });
  };

  // При зміні способу стрічка карток повертається на початок
  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [method]);

  const dark = method === 0;

  return (
    <LazyMotion features={domAnimation} strict>
      <section id="steps" className="bg-grain py-16 sm:py-20 lg:py-28">
        <div className={wrap}>
          <m.div {...fadeUp()} className="max-w-2xl">
            <p className="eyebrow">Як працюємо</p>
            <h2 className="text-h2 mt-3">
              Отримати розрахунок можна двома{' '}
              <span className="text-forest-600">зручними способами</span>
            </h2>
          </m.div>

          {/* Перемикач способів */}
          <m.div
            {...fadeUp(0.1)}
            role="tablist"
            aria-label="Способи розрахунку"
            className="relative mt-8 grid max-w-xl grid-cols-2 rounded-full bg-forest-900/[0.07] p-1.5"
          >
            <span
              aria-hidden
              className="absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full bg-forest-900 shadow-soft transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(${method * 100}%)` }}
            />
            {methods.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={method === index}
                onClick={() => chooseMethod(index)}
                className={cn(
                  'relative z-10 rounded-full px-3 py-3 text-center font-display text-sm font-semibold transition-colors duration-300 sm:px-5',
                  method === index ? 'text-lime-400' : 'text-forest-900/70',
                )}
              >
                {item.label}
              </button>
            ))}
          </m.div>

          <div
            ref={ref}
            className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10"
          >
            {/* Сцена */}
            <m.div
              {...fadeUp(0.15)}
              className={cn(
                'rounded-leaf relative order-1 flex min-h-[26.5rem] flex-col justify-center overflow-hidden p-4 shadow-lift transition-colors duration-500 sm:p-8 lg:order-2 lg:min-h-0',
                dark
                  ? 'bg-forest-900'
                  : 'border border-forest-900/10 bg-cream-50',
              )}
            >
              {/* Смуги газону на фоні сцени */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity: dark ? 0.9 : 0,
                  backgroundImage:
                    'repeating-linear-gradient(90deg, transparent 0 56px, rgb(255 255 255 / 0.03) 56px 112px)',
                }}
              />
              <div key={method} className="relative animate-fade-up">
                {method === 0 ? (
                  <div className="relative overflow-hidden rounded-3xl py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        aria-hidden
                        className="absolute top-1/2 left-1/2 size-44 -translate-x-1/2 -translate-y-1/2 animate-ring rounded-full border-2 border-lime-400/40"
                        style={{ animationDelay: `${i * 0.95}s` }}
                      />
                    ))}
                    <ChatScene stage={stage} />
                    {messengers.map(({ Icon, color, pos, delay }) => (
                      <m.span
                        key={color}
                        aria-hidden
                        initial={false}
                        animate={
                          stage >= 1
                            ? { opacity: 1, scale: 1, rotate: 0 }
                            : { opacity: 0, scale: 0.3, rotate: -30 }
                        }
                        transition={{ duration: 0.6, delay, ease: POP }}
                        className={cn('absolute', pos)}
                      >
                        <span
                          className="grid size-9 animate-float place-items-center rounded-xl text-white shadow-lift sm:size-11 sm:rounded-2xl"
                          style={{
                            backgroundColor: color,
                            animationDelay: `${delay * 8}s`,
                          }}
                        >
                          <Icon className="size-5 sm:size-6" />
                        </span>
                      </m.span>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-forest-900/20 bg-[linear-gradient(rgb(31_61_43/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(31_61_43/0.07)_1px,transparent_1px)] bg-[size:22px_22px] p-3 sm:p-5">
                    <PlotScene stage={stage} />
                  </div>
                )}
              </div>

              {/* Прогрес: крапки під сценою */}
              <div
                className="relative mt-5 hidden justify-center gap-1.5 lg:flex"
                aria-hidden
              >
                {current.steps.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-[width,background-color] duration-500',
                      stage === i + 1
                        ? cn('w-8', dark ? 'bg-lime-400' : 'bg-forest-900')
                        : cn(
                            'w-1.5',
                            dark ? 'bg-cream-50/25' : 'bg-forest-900/20',
                          ),
                    )}
                  />
                ))}
              </div>
            </m.div>

            {/* Кроки, кнопки */}
            <div className="order-2 min-w-0 lg:order-1">
              <div key={`t-${method}`} className="animate-fade-up">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold sm:text-2xl">
                    {current.title}
                  </h3>
                  {current.badge && (
                    <span className="rounded-full bg-lime-400 px-3 py-1 font-display text-xs font-semibold text-forest-950">
                      {current.badge}
                    </span>
                  )}
                </div>
              </div>

              <ol className="mt-5 hidden space-y-2.5 lg:block">
                {current.steps.map((text, index) => {
                  const active = stage === index + 1;
                  const done = stage > index + 1;
                  return (
                    <li key={`${method}-${text}`}>
                      <button
                        type="button"
                        onClick={() => chooseStep(index)}
                        aria-current={active ? 'step' : undefined}
                        className={cn(
                          'flex w-full items-center gap-4 rounded-2xl border-2 p-3.5 text-left transition-[background-color,border-color,color,opacity,translate] duration-500 active:scale-[0.99]',
                          active
                            ? 'border-forest-900 bg-forest-900 text-cream-50 lg:translate-x-2'
                            : done
                              ? 'border-forest-900/15 bg-forest-900/[0.05] text-ink-900'
                              : 'border-forest-900/10 text-ink-900 opacity-60 hover:opacity-100',
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold transition-colors duration-500',
                            active || done
                              ? 'bg-lime-400 text-forest-950'
                              : 'bg-forest-900/10 text-forest-900/50',
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="leading-snug">{text}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {/* Телефон: картки кроків гортаються пальцем, сцена зверху змінюється разом із ними */}
              <div className="lg:hidden">
                <div
                  ref={scrollerRef}
                  onScroll={onScroll}
                  className="-mx-4 mt-5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
                >
                  {current.steps.map((text, index) => (
                    <div
                      key={`${method}-${index}`}
                      className={cn(
                        'flex shrink-0 basis-[86%] snap-start items-start gap-4 rounded-2xl p-4 transition-[background-color,color,opacity] duration-300 sm:basis-[60%]',
                        stage === index + 1
                          ? 'bg-forest-900 text-cream-50'
                          : 'bg-forest-900/[0.06] text-ink-900 opacity-70',
                      )}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime-400 font-display text-sm font-bold text-forest-950">
                        {index + 1}
                      </span>
                      <p className="text-base leading-snug">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Попередній крок"
                    disabled={stage <= 1}
                    onClick={() => goTo(stage - 2)}
                    className="grid size-12 place-items-center rounded-full border-2 border-forest-900/20 text-forest-900 transition-[opacity,scale] duration-200 active:scale-95 disabled:opacity-30"
                  >
                    <ArrowLeftIcon
                      aria-hidden
                      weight="bold"
                      className="size-5"
                    />
                  </button>
                  <div className="flex items-center">
                    {current.steps.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Крок ${i + 1}`}
                        aria-current={stage === i + 1 ? 'step' : undefined}
                        onClick={() => goTo(i)}
                        className="grid h-12 w-8 place-items-center"
                      >
                        <span
                          className={cn(
                            'h-2 rounded-full transition-[width,background-color] duration-300',
                            stage === i + 1
                              ? 'w-7 bg-forest-900'
                              : 'w-2 bg-forest-900/25',
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label="Наступний крок"
                    disabled={stage >= count}
                    onClick={() => goTo(Math.max(stage, 1))}
                    className="grid size-12 place-items-center rounded-full bg-forest-900 text-lime-400 transition-[opacity,scale] duration-200 active:scale-95 disabled:opacity-30"
                  >
                    <ArrowRightIcon
                      aria-hidden
                      weight="bold"
                      className="size-5"
                    />
                  </button>
                </div>
              </div>

              {method === 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <a
                    href={contacts.telegram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      ctaButton,
                      'col-span-2 bg-lime-400 px-4 text-forest-950 shadow-cta hover:bg-lime-300 sm:col-span-1',
                    )}
                  >
                    <FaTelegram aria-hidden className="size-5" />
                    Telegram
                  </a>
                  <a
                    href={contacts.viber.href}
                    className={cn(
                      ctaButton,
                      'border-2 border-forest-900/20 px-4 text-forest-900 hover:bg-forest-900/5',
                    )}
                  >
                    <FaViber aria-hidden className="size-5" />
                    Viber
                  </a>
                  <a
                    href={contacts.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      ctaButton,
                      'border-2 border-forest-900/20 px-4 text-forest-900 hover:bg-forest-900/5',
                    )}
                  >
                    <FaWhatsapp aria-hidden className="size-6" />
                    WhatsApp
                  </a>
                </div>
              ) : (
                <p className="mt-6 rounded-2xl bg-lime-400/25 p-4 text-sm text-forest-900">
                  {visit.note}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
