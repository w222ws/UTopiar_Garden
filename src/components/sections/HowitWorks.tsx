import { domAnimation, LazyMotion, m } from 'motion/react';
import { FaTelegram, FaViber, FaWhatsapp } from 'react-icons/fa6';
import { contacts } from '../../data/site';
import { cn } from '../../lib/cn';

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
const EASE = [0.22, 1, 0.36, 1] as const;

const ctaButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full px-4 font-display text-sm font-semibold transition-[translate,scale,background-color] duration-200 hover:-translate-y-0.5 active:scale-[0.97]';

/* Один раз при появленні на екрані. Тільки opacity + transform, без таймерів і стану. */
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, delay, ease: EASE },
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

/* Кроки: нумерований список з лінією. Статичний, читається одразу. */
function Steps({ steps, dark }: { steps: string[]; dark?: boolean }) {
  return (
    <ol className="relative mt-6">
      <span
        aria-hidden
        className={cn(
          'absolute top-5 bottom-5 left-5 w-0.5 -translate-x-1/2 rounded-full',
          dark ? 'bg-lime-400/40' : 'bg-forest-900/20',
        )}
      />
      {steps.map((text, index) => (
        <m.li
          key={text}
          {...reveal(index * 0.08)}
          className="relative flex items-start gap-4 pb-5 last:pb-0"
        >
          <span
            className={cn(
              'relative grid size-10 shrink-0 place-items-center rounded-full font-display text-sm font-bold',
              dark
                ? 'bg-lime-400 text-forest-950'
                : 'bg-forest-900 text-lime-400',
            )}
          >
            {index + 1}
          </span>
          <p
            className={cn(
              'pt-2 text-base leading-snug',
              dark ? 'text-cream-50' : 'text-ink-900',
            )}
          >
            {text}
          </p>
        </m.li>
      ))}
    </ol>
  );
}

/* Чат у телефоні: клієнт кинув фото й відео, ми порахували, відповіли. Статичний макет. */
function ChatMock() {
  return (
    <div className="relative mx-auto w-full max-w-[16rem] rounded-[2.25rem] bg-forest-950 p-2 shadow-lift ring-1 ring-cream-50/15">
      <div className="overflow-hidden rounded-[1.75rem] bg-cream-100">
        <div className="flex items-center gap-2.5 border-b border-forest-900/10 bg-cream-50 px-4 py-3">
          <span className="grid size-8 place-items-center rounded-full bg-forest-900 font-display text-xs font-bold text-lime-400">
            U
          </span>
          <p className="font-display text-xs font-bold text-forest-900">
            UTopiar Garden
          </p>
        </div>

        <div className="flex flex-col gap-2.5 p-3">
          {/* Клієнт: фото і відео */}
          <div className="self-end rounded-2xl rounded-br-md bg-lime-400 px-3 py-2.5">
            <div className="grid w-36 grid-cols-3 gap-1.5">
              <span className="aspect-square rounded-lg bg-[radial-gradient(120%_70%_at_30%_110%,#356648_55%,transparent_56%),linear-gradient(#cdec74,#9cc933)]" />
              <span className="aspect-square rounded-lg bg-[radial-gradient(100%_60%_at_80%_110%,#46805c_55%,transparent_56%),linear-gradient(#e0f5a6,#b9e04a)]" />
              <span className="relative grid aspect-square place-items-center rounded-lg bg-forest-900">
                <span className="ml-0.5 size-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-lime-400" />
                <span className="absolute right-1 bottom-0.5 text-[0.5625rem] font-semibold text-cream-50">
                  0:12
                </span>
              </span>
            </div>
          </div>

          {/* Ми: 15 хвилин */}
          <div className="flex max-w-[88%] items-center gap-3 self-start rounded-2xl rounded-bl-md border border-forest-900/10 bg-white px-3 py-2.5 text-[0.8125rem] leading-snug text-ink-900">
            <svg viewBox="0 0 44 44" className="size-11 shrink-0" aria-hidden>
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#e3eee6"
                strokeWidth="5"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="#46805c"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="113"
                transform="rotate(-90 22 22)"
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

          <div className="max-w-[88%] self-start rounded-2xl rounded-bl-md border border-forest-900/10 bg-white px-3.5 py-2.5 text-[0.8125rem] leading-snug text-ink-900">
            Відповімо на всі питання
          </div>
        </div>
      </div>

      {/* Месенджери */}
      {[
        { Icon: FaTelegram, color: '#229ED9', pos: '-left-3 top-14' },
        { Icon: FaViber, color: '#7360F2', pos: '-right-3 top-36' },
        { Icon: FaWhatsapp, color: '#25D366', pos: '-left-3 bottom-16' },
      ].map(({ Icon, color, pos }) => (
        <span
          key={color}
          aria-hidden
          className={cn(
            'absolute grid size-10 place-items-center rounded-xl text-white shadow-lift',
            pos,
          )}
          style={{ backgroundColor: color }}
        >
          <Icon className="size-5" />
        </span>
      ))}
    </div>
  );
}

/* План ділянки: заміри, оцінка рослин, консультація, кошторис. Статичний SVG. */
function PlotMock() {
  const trees = [
    { x: 92, y: 118, r: 20 },
    { x: 150, y: 168, r: 13 },
    { x: 276, y: 112, r: 22 },
  ];
  return (
    <svg
      viewBox="0 0 360 250"
      role="img"
      aria-label="План ділянки із замірами, оцінкою рослин і кошторисом"
      className="mx-auto block h-auto w-full max-w-[26rem]"
    >
      <path
        d="M26 74 L150 50 L332 66 L340 196 L190 220 L38 202 Z"
        fill="#e3eee6"
        stroke="#356648"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
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

      {trees.map((t, i) => (
        <g key={i}>
          <circle cx={t.x} cy={t.y} r={t.r} fill="#46805c" />
          <circle
            cx={t.x - t.r * 0.25}
            cy={t.y - t.r * 0.25}
            r={t.r * 0.55}
            fill="#5f9b75"
          />
          <circle
            cx={t.x}
            cy={t.y}
            r={t.r + 9}
            fill="none"
            stroke="#9cc933"
            strokeWidth="2.5"
            strokeDasharray="5 5"
          />
        </g>
      ))}

      <circle cx="190" cy="176" r="16" fill="#b9e04a" opacity="0.35" />
      <circle
        cx="190"
        cy="176"
        r="8"
        fill="#b9e04a"
        stroke="#11261a"
        strokeWidth="2.5"
      />

      <path
        d="M26 232 L340 232 M26 226 L26 238 M340 226 L340 238 M12 74 L12 202 M6 74 L18 74 M6 202 L18 202"
        fill="none"
        stroke="#c8763a"
        strokeWidth="2"
        strokeLinecap="round"
      />

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

      <g transform="rotate(3 292 186)">
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
      </g>
    </svg>
  );
}

export function HowItWorks() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section id="steps" className="bg-grain py-16 sm:py-20 lg:py-28">
        <div className={wrap}>
          <m.div {...reveal()} className="max-w-2xl">
            <p className="eyebrow">Як працюємо</p>
            <h2 className="text-h2 mt-3">
              Отримати розрахунок можна двома{' '}
              <span className="text-forest-600">зручними способами</span>
            </h2>
          </m.div>

          <div className="relative mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-6">
            {/* Спосіб 1 */}
            <m.article
              {...reveal()}
              className="rounded-leaf flex min-w-0 flex-col bg-forest-900 p-5 text-cream-50 shadow-lift sm:p-9"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-xs font-semibold tracking-widest text-lime-400 uppercase">
                  Спосіб 1
                </span>
                <span className="rounded-full bg-lime-400 px-3 py-1 font-display text-xs font-semibold text-forest-950">
                  {online.badge}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-cream-50 sm:text-2xl">
                {online.title}
              </h3>

              <div className="mt-6 px-3">
                <ChatMock />
              </div>

              <Steps steps={online.steps} dark />

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-auto lg:pt-7">
                <a
                  href={contacts.telegram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    ctaButton,
                    'col-span-2 bg-lime-400 text-forest-950 shadow-cta hover:bg-lime-300 sm:col-span-1',
                  )}
                >
                  <FaTelegram aria-hidden className="size-5" />
                  Telegram
                </a>
                <a
                  href={contacts.viber.href}
                  className={cn(
                    ctaButton,
                    'border-2 border-cream-50/30 text-cream-50 hover:bg-cream-50/10',
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
                    'border-2 border-cream-50/30 text-cream-50 hover:bg-cream-50/10',
                  )}
                >
                  <FaWhatsapp aria-hidden className="size-6" />
                  WhatsApp
                </a>
              </div>
            </m.article>

            {/* «або»: на десктопі по центру між картками, на телефоні в проміжку */}
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 z-10 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-cream-100 bg-lime-400 font-display text-sm font-extrabold text-forest-950 shadow-cta max-lg:hidden"
            >
              або
            </span>
            <div
              aria-hidden
              className="-my-3 grid place-items-center lg:hidden"
            >
              <span className="grid size-12 place-items-center rounded-full border-4 border-cream-100 bg-lime-400 font-display text-sm font-extrabold text-forest-950 shadow-cta">
                або
              </span>
            </div>

            {/* Спосіб 2 */}
            <m.article
              {...reveal()}
              className="rounded-leaf-alt flex min-w-0 flex-col border border-forest-900/10 bg-cream-50 p-5 shadow-soft sm:p-9"
            >
              <span className="font-display text-xs font-semibold tracking-widest text-forest-600 uppercase">
                Спосіб 2
              </span>
              <h3 className="mt-4 text-xl font-bold sm:text-2xl">
                {visit.title}
              </h3>

              <div className="mt-6 rounded-3xl border border-dashed border-forest-900/20 bg-[linear-gradient(rgb(31_61_43/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(31_61_43/0.07)_1px,transparent_1px)] bg-[size:22px_22px] p-3">
                <PlotMock />
              </div>

              <Steps steps={visit.steps} />

              <div className="mt-7 lg:mt-auto lg:pt-7">
                <p className="rounded-2xl bg-lime-400/25 p-4 text-sm text-forest-900">
                  {visit.note}
                </p>
              </div>
            </m.article>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
