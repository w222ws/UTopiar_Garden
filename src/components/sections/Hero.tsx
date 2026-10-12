import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowDownIcon, MapPinIcon } from '@phosphor-icons/react';
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  type Variants,
} from 'motion/react';
import heroImage from '../../assets/hero.avif';
import { cn } from '../../lib/cn';

const EASE = [0.22, 1, 0.36, 1] as const;

/*
  Кадр фото на телефоне.
  TREE_TOP: на скільки відсотків зверху фото (0 = край неба, 100 = низ) знаходиться
  верхівка фіолетово-червоного дерева. Кадр на телефоні починається саме з цієї точки,
  тож нижче дерева видно кущі й газон. Більше число = фото ще нижче, видно менше неба.
  Максимум корисного значення 40: це вже самий низ фото.
*/
const TREE_TOP = 25;
const MOBILE_FOCUS_Y = Math.min(100, (TREE_TOP / 40) * 100);

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
   Фото: при заході майже чорно-біле (не на 100%), з першим скролом
   (колесо, палець, клавіші) плавно стає яскравим. Тільки CSS-перехід filter.
   ========================================================================== */

function useFirstScroll(ready: boolean) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (window.scrollY > 4) {
      setScrolled(true);
      return;
    }
    const opts = { passive: true } as const;
    const events = ['scroll', 'wheel', 'touchmove', 'keydown'] as const;
    const done = () => {
      setScrolled(true);
      events.forEach((e) => window.removeEventListener(e, done));
    };
    events.forEach((e) => window.addEventListener(e, done, opts));
    return () => events.forEach((e) => window.removeEventListener(e, done));
  }, []);

  /* Только десктоп: через 0,5 с после появления страницы фото само становится цветным */
  useEffect(() => {
    if (!ready || !window.matchMedia('(min-width: 1024px)').matches) return;
    const id = window.setTimeout(() => setScrolled(true), 700);
    return () => window.clearTimeout(id);
  }, [ready]);

  return scrolled;
}

function HeroPhoto({ bright }: { bright: boolean }) {
  return (
    <div className="rounded-leaf relative aspect-[4/3] overflow-hidden bg-forest-100 shadow-[0_1px_2px_rgb(23_32_27/0.18),0_12px_24px_-8px_rgb(31_61_43/0.35),0_40px_70px_-24px_rgb(31_61_43/0.55)] lg:aspect-[4/5]">
      <img
        src={heroImage}
        alt="Доглянутий газон і територія після роботи"
        width={1200}
        height={1500}
        fetchPriority="high"
        decoding="async"
        className={cn(
          'size-full object-cover object-[50%_var(--focus-y)] transition-[filter] duration-[1600ms] ease-out motion-reduce:transition-none lg:object-center',
          bright
            ? '[filter:grayscale(0)_brightness(1)]'
            : '[filter:grayscale(0.85)_brightness(0.8)]',
        )}
        style={{ '--focus-y': `${MOBILE_FOCUS_Y}%` } as CSSProperties}
      />
    </div>
  );
}

export function Hero() {
  const ready = useAppReady();
  const bright = useFirstScroll(ready);

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
                  className="mt-5 text-[clamp(1.9rem,10vw,4.5rem)] leading-[1.04] font-extrabold tracking-[-0.035em] lg:mt-6 lg:text-[3.1rem] xl:text-[3.6rem]"
                >
                  <span className={headingLine}>
                    <m.span variants={lineUp} className="block">
                      Розкриваємо
                    </m.span>
                  </span>
                  <span className={headingLine}>
                    <m.span variants={lineUp} className="block text-forest-600">
                      яскравість
                    </m.span>
                  </span>
                  <span className={headingLine}>
                    <m.span variants={lineUp} className="block">
                      і красу
                    </m.span>
                  </span>
                  <span className={headingLine}>
                    <m.span variants={lineUp} className="block">
                      вашого саду
                    </m.span>
                  </span>
                </m.h1>
              </div>

              <div className="order-3 text-center lg:mt-7 lg:text-left">
                <m.p
                  variants={rise}
                  className="text-lead mx-auto max-w-md lg:mx-0"
                >
                  Стрижка газону, обрізка дерев і кущів, прибирання території.
                  Скиньте фото ділянки у Viber, Telegram або WhatsApp, і за 15
                  хвилин ми назвемо орієнтовну ціну.
                </m.p>

                <m.div
                  variants={rise}
                  className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-7 lg:justify-start"
                >
                  <a
                    href="#services"
                    className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-lime-400 px-8 font-display text-base font-semibold text-forest-950 shadow-cta transition-[translate,scale,background-color] duration-200 hover:-translate-y-0.5 hover:bg-lime-300 active:scale-[0.97]"
                  >
                    Послуги та вартість
                  </a>
                  <a
                    href="#works"
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

            {/* Фото: ч/б → яркое с первым скролом */}
            <div className="relative order-2">
              <HeroPhoto bright={bright} />
            </div>
          </m.div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
