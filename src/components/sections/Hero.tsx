import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownIcon,
  HandSwipeRightIcon,
  MapPinIcon,
} from '@phosphor-icons/react';
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  type Variants,
} from 'motion/react';
import { FaTelegram } from 'react-icons/fa6';
import heroImage from '../../assets/hero.avif';
import { contacts } from '../../data/site';
import { cn } from '../../lib/cn';

const EASE = [0.22, 1, 0.36, 1] as const;

/* Анимации текста: только opacity и transform, поэтому на телефоне плавно */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/* Строка заголовка выезжает из-под «маски» */
const lineUp: Variants = {
  hidden: { y: '108%' },
  show: { y: '0%', transition: { duration: 0.85, ease: EASE } },
};

const headingLine = 'block overflow-hidden pb-[0.1em]';

/* ==========================================================================
   Экран загрузки (см. index.html) шлёт событие "app:ready", когда поднимается.
   До этого момента анимации Hero ждут, чтобы их было видно.
   ========================================================================== */

const isLoading = () =>
  typeof document !== 'undefined' &&
  document.documentElement.classList.contains('is-loading');

function useAppReady() {
  const [ready, setReady] = useState(() => !isLoading());

  useEffect(() => {
    if (ready) return;
    const onReady = () => setReady(true);
    window.addEventListener('app:ready', onReady, { once: true });
    // на случай, если событие прилетело между рендером и подпиской
    const frame = requestAnimationFrame(() => {
      if (!isLoading()) onReady();
    });
    return () => {
      window.removeEventListener('app:ready', onReady);
      cancelAnimationFrame(frame);
    };
  }, [ready]);

  return ready;
}

/* ==========================================================================
   Фото в пятнах грязи: проводишь пальцем или курсором, и грязь стирается.
   Рисуется на canvas один раз, дальше только стирание кистью.
   ========================================================================== */

type Point = { x: number; y: number };
type Phase = 'dirty' | 'fading' | 'done';

/* Земля, глина, пыль, мох */
const DIRT_COLORS: [number, number, number][] = [
  [88, 68, 46],
  [112, 90, 62],
  [70, 78, 62],
  [140, 118, 84],
];

/* Детерминированный random: узор пятен одинаковый при каждой загрузке */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function DirtyPhoto({ ready }: { ready: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(ready);
  const startDemoRef = useRef<() => void>(() => {});

  /* Людям с «уменьшить движение» сразу показываем чистое фото */
  const [phase, setPhase] = useState<Phase>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'done'
      : 'dirty',
  );
  const [touched, setTouched] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !frame || !ctx) return;

    /* Сетка для подсчёта, сколько грязи уже стёрто */
    const GX = 24;
    const GY = 30;

    let w = 0;
    let h = 0;
    let radius = 30;
    let cells = new Uint8Array(0); // 0 нет грязи, 1 грязь, 2 стёрто
    let dirtyTotal = 0;
    let clearedCount = 0;

    let painted = false;
    let finished = false;
    let hasTouched = false;
    let down = false;
    let last: Point | null = null;
    let demoStarted = false;
    let demoTimer = 0;
    let demoFrame = 0;
    let idleTimer = 0;
    let doneTimer = 0;

    const drawLobe = (
      cx: number,
      cy: number,
      r: number,
      c: [number, number, number],
      alpha: number,
    ) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${alpha})`);
      g.addColorStop(0.72, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.9})`);
      g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const paintDirt = () => {
      w = Math.round(frame.clientWidth);
      h = Math.round(frame.clientHeight);
      if (!w || !h) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      radius = Math.max(26, w * 0.085);

      // лёгкая «дымка» по всему кадру
      ctx.fillStyle = 'rgba(96,78,54,0.16)';
      ctx.fillRect(0, 0, w, h);

      const rand = seeded(11);

      // крупные пятна: несколько наложенных мягких кругов
      for (let i = 0; i < 14; i++) {
        const cx = rand() * w;
        const cy = rand() * h;
        const base = (0.06 + rand() * 0.1) * w;
        const color = DIRT_COLORS[Math.floor(rand() * DIRT_COLORS.length)];
        for (let k = 0; k < 4; k++) {
          drawLobe(
            cx + (rand() - 0.5) * base,
            cy + (rand() - 0.5) * base,
            base * (0.55 + rand() * 0.5),
            color,
            0.78 + rand() * 0.2,
          );
        }
      }

      // брызги и крапинки
      for (let i = 0; i < 110; i++) {
        const color = DIRT_COLORS[Math.floor(rand() * DIRT_COLORS.length)];
        drawLobe(rand() * w, rand() * h, 1.5 + rand() * 6, color, 0.7);
      }

      // считаем, в каких клетках есть грязь (по уменьшенной копии)
      cells = new Uint8Array(GX * GY);
      dirtyTotal = 0;
      clearedCount = 0;
      const probe = document.createElement('canvas');
      probe.width = GX;
      probe.height = GY;
      const pctx = probe.getContext('2d');
      if (pctx) {
        pctx.drawImage(canvas, 0, 0, GX, GY);
        const data = pctx.getImageData(0, 0, GX, GY).data;
        for (let i = 0; i < GX * GY; i++) {
          if (data[i * 4 + 3] > 90) {
            cells[i] = 1;
            dirtyTotal++;
          }
        }
      }
      painted = true;
    };

    const markCells = (x: number, y: number) => {
      const reach = radius * 0.8;
      const i0 = Math.max(0, Math.floor(((x - reach) / w) * GX));
      const i1 = Math.min(GX - 1, Math.floor(((x + reach) / w) * GX));
      const j0 = Math.max(0, Math.floor(((y - reach) / h) * GY));
      const j1 = Math.min(GY - 1, Math.floor(((y + reach) / h) * GY));
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const idx = j * GX + i;
          if (cells[idx] !== 1) continue;
          const cx = ((i + 0.5) / GX) * w;
          const cy = ((j + 0.5) / GY) * h;
          if ((cx - x) ** 2 + (cy - y) ** 2 <= reach * reach) {
            cells[idx] = 2;
            clearedCount++;
          }
        }
      }
    };

    /* Мягкая кисть: стирает грязь, фото под ней остаётся */
    const wipeAt = (x: number, y: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.55, 'rgba(0,0,0,0.9)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      markCells(x, y);
    };

    /* Линия между двумя точками без «дырок» при быстром движении */
    const stroke = (a: Point, b: Point) => {
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const step = Math.max(4, radius * 0.35);
      const n = Math.max(1, Math.ceil(dist / step));
      for (let k = 1; k <= n; k++) {
        wipeAt(a.x + ((b.x - a.x) * k) / n, a.y + ((b.y - a.y) * k) / n);
      }
    };

    const stopDemo = () => {
      window.clearTimeout(demoTimer);
      cancelAnimationFrame(demoFrame);
    };

    /* Остаток грязи плавно исчезает. Если фото вытер сам человек, будет отклик:
       блик по фото, «пульс», вибрация на телефоне и кнопка в Telegram. */
    const finish = () => {
      if (finished) return;
      finished = true;
      stopDemo();
      window.clearTimeout(idleTimer);
      if (hasTouched) {
        setCelebrate(true);
        if ('vibrate' in navigator) navigator.vibrate(25);
      }
      setPhase('fading');
      doneTimer = window.setTimeout(() => setPhase('done'), 800);
    };

    const armIdle = (ms: number) => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(finish, ms);
    };

    const checkProgress = () => {
      if (dirtyTotal === 0 || clearedCount / dirtyTotal >= 0.6) finish();
    };

    const interact = (p: Point) => {
      stopDemo();
      if (!hasTouched) {
        hasTouched = true;
        setTouched(true);
      }
      if (last) stroke(last, p);
      else wipeAt(p.x, p.y);
      last = p;
      checkProgress();
      armIdle(3500);
    };

    const toPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    /* Мышь стирает при наведении, палец и стилус при касании */
    const onDown = (e: PointerEvent) => {
      down = true;
      last = null;
      interact(toPoint(e));
    };
    const onMove = (e: PointerEvent) => {
      if (!down && e.pointerType !== 'mouse') return;
      interact(toPoint(e));
    };
    const onUp = () => {
      down = false;
      last = null;
    };

    /* Демонстрация: один плавный мазок, чтобы было понятно, что можно тереть */
    const runDemo = () => {
      const start = performance.now();
      const duration = 1000;
      let prev: Point | null = null;

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
        const p: Point = {
          x: w * (0.12 + 0.76 * e),
          y: h * (0.55 - 0.18 * e) + Math.sin(e * Math.PI * 3) * h * 0.07,
        };
        if (prev) stroke(prev, p);
        else wipeAt(p.x, p.y);
        prev = p;

        if (t < 1) {
          demoFrame = requestAnimationFrame(tick);
        } else {
          checkProgress();
          armIdle(6500);
        }
      };
      demoFrame = requestAnimationFrame(tick);
    };

    /* Мазок запускается, когда грязь нарисована И экран загрузки уже поднялся */
    const tryStartDemo = () => {
      if (finished || demoStarted || !painted || !readyRef.current) return;
      demoStarted = true;
      demoTimer = window.setTimeout(runDemo, 700);
    };
    startDemoRef.current = tryStartDemo;

    const observer = new ResizeObserver(() => {
      if (finished) return;
      const width = Math.round(frame.clientWidth);
      if (width === 0 || Math.abs(width - w) <= 2) return;
      paintDirt();
      tryStartDemo();
    });
    observer.observe(frame);

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onUp);

    return () => {
      startDemoRef.current = () => {};
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      stopDemo();
      window.clearTimeout(idleTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    readyRef.current = ready;
    if (ready) startDemoRef.current();
  }, [ready]);

  return (
    <m.div
      ref={frameRef}
      animate={celebrate ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="rounded-leaf relative aspect-[4/3] overflow-hidden bg-forest-100 shadow-[0_1px_2px_rgb(23_32_27/0.18),0_12px_24px_-8px_rgb(31_61_43/0.35),0_40px_70px_-24px_rgb(31_61_43/0.55)] lg:aspect-[4/5]"
    >
      {/* Главный (LCP) кадр: грузим сразу, не lazy */}
      <img
        src={heroImage}
        alt="Доглянутий газон і територія після роботи"
        width={1200}
        height={1500}
        fetchPriority="high"
        decoding="async"
        className="size-full object-cover"
      />

      {phase !== 'done' && (
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn(
            'absolute inset-0 size-full touch-pan-y transition-opacity duration-700',
            phase === 'fading' && 'pointer-events-none opacity-0',
          )}
        />
      )}

      {/* Подсказка пропадает, как только человек начал тереть */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-opacity duration-500',
          touched || phase !== 'dirty' ? 'opacity-0' : 'opacity-100',
        )}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-cream-50/95 px-4 py-2 text-sm font-medium text-forest-900 shadow-soft">
          <HandSwipeRightIcon weight="bold" className="size-4 animate-float" />
          Протріть фото
        </span>
      </div>

      {/* Отклик на полностью вытертое фото */}
      {celebrate && (
        <>
          <m.div
            aria-hidden
            initial={{ x: '-130%' }}
            animate={{ x: '330%' }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
            style={{ skewX: -14 }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/50 to-transparent"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-3">
            <m.a
              href={contacts.telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-forest-950 shadow-cta"
            >
              <FaTelegram aria-hidden className="size-4 shrink-0" />
              Чисто! Надішліть фото двору
            </m.a>
          </div>
        </>
      )}
    </m.div>
  );
}

/* ==========================================================================
   Hero
   Мобильный порядок: плашка → заголовок → фото → текст и кнопки (всё по центру).
   Десктоп: текст слева, фото справа.
   ========================================================================== */

export function Hero() {
  const ready = useAppReady();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <section className="relative overflow-hidden">
          <m.div
            initial="hidden"
            animate={ready ? 'show' : 'hidden'}
            variants={container}
            className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pt-10 lg:pb-24"
          >
            {/* На мобильном обёртка «растворяется», и блоки встают в порядок через order */}
            <div className="contents lg:block">
              <div className="order-1 text-center lg:text-left">
                <m.p
                  variants={rise}
                  className="inline-flex items-center gap-2.5 rounded-full bg-forest-900 py-1.5 pr-4 pl-1.5 text-sm font-medium text-cream-50 shadow-soft"
                >
                  <span
                    aria-hidden
                    className="grid size-7 place-items-center rounded-full bg-lime-400 text-forest-950"
                  >
                    <MapPinIcon weight="fill" className="size-4" />
                  </span>
                  Працюємо по Дніпру та області
                </m.p>

                <m.h1
                  variants={container}
                  className="mt-5 text-[clamp(2rem,11vw,5rem)] leading-[1.02] font-extrabold tracking-[-0.035em] lg:mt-6 lg:text-[3.75rem] xl:text-[4.25rem]"
                >
                  <span className={headingLine}>
                    <m.span variants={lineUp} className="block">
                      Приведемо
                    </m.span>
                  </span>
                  <span className={headingLine}>
                    <m.span variants={lineUp} className="block">
                      двір
                    </m.span>
                  </span>
                  <span className={headingLine}>
                    <m.span variants={lineUp} className="block text-forest-600">
                      до ладу
                    </m.span>
                  </span>
                </m.h1>
              </div>

              <div className="order-3 text-center lg:mt-7 lg:text-left">
                <m.p
                  variants={rise}
                  className="text-lead mx-auto max-w-md lg:mx-0"
                >
                  Стрижка газону, обрізка дерев і кущів, прибирання території та
                  листя. Надішліть фото ділянки в Telegram, і ми назвемо ціну до
                  виїзду.
                </m.p>

                <m.div
                  variants={rise}
                  className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-7 lg:justify-start"
                >
                  <a
                    href={contacts.telegram.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-lime-400 px-8 font-display text-base font-semibold text-forest-950 shadow-cta transition-[translate,scale,background-color] duration-200 hover:-translate-y-0.5 hover:bg-lime-300 active:scale-[0.97]"
                  >
                    <FaTelegram aria-hidden className="size-5" />
                    Записатися в Telegram
                  </a>
                  <a
                    href="#services"
                    className="group inline-flex items-center justify-center gap-2 py-2 font-display text-sm font-semibold text-forest-900"
                  >
                    <span className="border-b-2 border-forest-900/20 pb-0.5 transition-colors group-hover:border-forest-900">
                      Що ми робимо
                    </span>
                    <ArrowDownIcon
                      aria-hidden
                      weight="bold"
                      className="size-4 transition-transform duration-200 group-hover:translate-y-0.5"
                    />
                  </a>
                </m.div>
              </div>
            </div>

            {/* Фото с грязью, которую можно стереть */}
            <div className="relative order-2">
              <DirtyPhoto ready={ready} />
            </div>
          </m.div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
