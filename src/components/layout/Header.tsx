import { useEffect, useState } from 'react';
import { ArrowUpRightIcon, PhoneCallIcon } from '@phosphor-icons/react';
import { FaTelegram, FaViber, FaWhatsapp } from 'react-icons/fa6';
import { business, contacts, navigation } from '../../data/site';
import { cn } from '../../lib/cn';

/* Общие классы, чтобы не повторять по файлу */
const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

const ctaButton =
  'inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 font-display font-semibold text-forest-950 shadow-cta transition-[translate,scale,background-color] duration-200 hover:-translate-y-0.5 hover:bg-lime-300 active:scale-[0.97]';

const messengerButton =
  'flex flex-col items-center gap-1.5 rounded-2xl border-2 border-forest-900/15 px-2 py-3 font-display text-xs font-semibold text-forest-900 transition-[scale,background-color] duration-200 active:scale-95 active:bg-forest-900/10';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* Фон шапки появляется после небольшого скролла.
     Слушатель passive + rAF, состояние меняется только при смене значения. */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /* Пока меню открыто: страница не скроллится, Escape закрывает,
     при переходе на десктопную ширину меню закрывается само. */
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    const desktop = window.matchMedia('(min-width: 1024px)');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onResize = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {/* Фон: сверху его нет, при скролле или открытом меню плавно появляется.
          Blur только на десктопе, на телефонах он тяжёлый для GPU. */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 -z-10 border-b border-forest-900/10 bg-cream-100/95 opacity-0 transition-opacity duration-300 lg:bg-cream-100/80 lg:backdrop-blur-md',
          (scrolled || open) && 'opacity-100',
        )}
      />

      <div
        className={cn(
          wrap,
          'flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]',
        )}
      >
        {/* ЗАГЛУШКА лого: потом заменим этот <a> на <img> с настоящим логотипом */}
        <a
          href="#top"
          className="shrink-0 rounded-md font-display text-lg font-bold tracking-tight whitespace-nowrap text-forest-900"
        >
          UTopiar <span className="text-forest-600">Garden</span>
        </a>

        {/* Навигация: десктоп */}
        <nav aria-label="Основна навігація" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group relative block px-4 py-2 font-medium whitespace-nowrap text-ink-700 transition-colors hover:text-forest-900"
                >
                  {item.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-4 bottom-0.5 h-[3px] origin-left scale-x-0 rounded-full bg-lime-500 transition-transform duration-300 ease-out group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Справа: десктоп */}
        <div className="hidden shrink-0 items-center lg:flex">
          <a
            href={contacts.telegram.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Записатися в Telegram"
            className={cn(ctaButton, 'h-11 px-5 text-sm')}
          >
            <FaTelegram aria-hidden className="size-5" />
            Записатися
          </a>
        </div>

        {/* Справа: мобильный (звонок + бургер) */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={contacts.phone.href}
            aria-label={contacts.phone.label}
            className="relative grid size-11 place-items-center rounded-full bg-lime-400 text-forest-950 shadow-cta transition-[scale] duration-200 active:scale-95"
          >
            {/* Пульсирующее кольцо: только transform + opacity */}
            <span
              aria-hidden
              className="absolute inset-0 animate-ring rounded-full bg-lime-400"
            />
            <PhoneCallIcon
              aria-hidden
              weight="fill"
              className="relative size-5"
            />
          </a>

          <button
            type="button"
            aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-full bg-forest-900 text-cream-50 transition-[scale] duration-200 active:scale-95"
          >
            {/* Две полоски → крестик */}
            <span aria-hidden className="relative block h-2.5 w-5">
              <span
                className={cn(
                  'absolute top-0 left-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-out',
                  open && 'translate-y-1 rotate-45',
                )}
              />
              <span
                className={cn(
                  'absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-out',
                  open && '-translate-y-1 -rotate-45',
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Мобильное меню на весь экран. Анимация: только opacity + translate (GPU).
          top-16 = высота шапки на мобильном. */}
      <div
        id="mobile-menu"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        className={cn(
          'bg-grain fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto overscroll-contain bg-cream-100 transition-[opacity,translate,visibility] duration-300 ease-out lg:hidden',
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-3 opacity-0',
        )}
      >
        <div className={cn(wrap, 'flex min-h-full flex-col py-4')}>
          <nav aria-label="Мобільне меню">
            <ul>
              {navigation.map((item, index) => (
                <li
                  key={item.href}
                  style={{
                    transitionDelay: open ? `${80 + index * 50}ms` : '0ms',
                  }}
                  className={cn(
                    'transition-[opacity,translate] duration-400 ease-out',
                    open
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-3 opacity-0',
                  )}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-forest-900/10 py-4 font-display text-2xl font-semibold text-forest-900 transition-colors active:text-forest-600"
                  >
                    {item.label}
                    <ArrowUpRightIcon
                      aria-hidden
                      weight="bold"
                      className="size-5 text-lime-500"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div
            style={{
              transitionDelay: open
                ? `${80 + navigation.length * 50}ms`
                : '0ms',
            }}
            className={cn(
              'mt-auto pt-8 transition-[opacity,translate] duration-400 ease-out',
              open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
          >
            <p className="mb-3 text-sm text-ink-500">
              Опишіть завдання або надішліть фото ділянки, і ми порахуємо
              вартість.
            </p>

            <a
              href={contacts.telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ctaButton, 'h-14 w-full px-8 text-base')}
            >
              <FaTelegram aria-hidden className="size-5" />
              Записатися в Telegram
            </a>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <a href={contacts.viber.href} className={messengerButton}>
                <FaViber aria-hidden className="size-5" />
                Viber
              </a>
              <a
                href={contacts.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className={messengerButton}
              >
                <FaWhatsapp aria-hidden className="size-5" />
                WhatsApp
              </a>
              <a href={contacts.phone.href} className={messengerButton}>
                <PhoneCallIcon aria-hidden weight="bold" className="size-5" />
                Дзвінок
              </a>
            </div>

            <p className="mt-4 pb-2 text-center text-sm text-ink-500">
              {business.workHours}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
