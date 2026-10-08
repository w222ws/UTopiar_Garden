import { useState } from 'react';
import { domAnimation, LazyMotion, m } from 'motion/react';
import { CheckIcon, PlusIcon } from '@phosphor-icons/react';
import { FaTelegram, FaViber, FaWhatsapp } from 'react-icons/fa6';
import { contacts } from '../../data/site';
import { faq } from '../../data/faq';
import { cn } from '../../lib/cn';

const wrap = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const ctaButton =
  'inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 font-display text-sm font-semibold transition-[translate,scale,background-color] duration-200 hover:-translate-y-0.5 active:scale-[0.97]';

/*
  FAQ як переписка. Питання клієнта — салатові «бульбашки», відповідь майстра
  з'являється під обраним: три точки «друкує…» (CSS) і потім текст.
  Жодних таймерів і анімації розмірів: усе на opacity і transform.
*/
export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        id="faq"
        className="bg-grain bg-cream-100 py-16 sm:py-20 lg:py-28"
      >
        <div
          className={cn(
            wrap,
            'grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16',
          )}
        >
          <m.div
            {...reveal()}
            className="lg:sticky lg:top-28 lg:self-start lg:pt-4"
          >
            <p className="eyebrow">FAQ</p>
            <h2 className="text-h2 mt-3 text-forest-900">
              Часті <span className="text-forest-600">питання</span>
            </h2>
            <p className="mt-4 max-w-sm text-ink-700">
              Не знайшли свого питання? Напишіть нам, відповімо у зручному
              месенджері.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-sm">
              <a
                href={contacts.telegram.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  ctaButton,
                  'col-span-2 bg-forest-900 text-cream-50 hover:bg-forest-800',
                )}
              >
                <FaTelegram aria-hidden className="size-5 text-lime-400" />
                Telegram
              </a>
              <a
                href={contacts.viber.href}
                className={cn(
                  ctaButton,
                  'border-2 border-forest-900/20 text-forest-900 hover:bg-forest-900/5',
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
                  'border-2 border-forest-900/20 text-forest-900 hover:bg-forest-900/5',
                )}
              >
                <FaWhatsapp aria-hidden className="size-6" />
                WhatsApp
              </a>
            </div>

            {/* Декор для десктопа: великий знак питання та картка з оцінкою. Статичний, без анімацій. */}
            <div aria-hidden className="relative mt-12 hidden h-60 lg:block">
              <span
                className="absolute top-0 left-0 grid size-52 place-items-center rounded-full font-display text-[9rem] leading-none font-extrabold text-forest-950"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 32% 28%, #cdec74, #b9e04a 55%, #8ab72a)',
                }}
              >
                ?
              </span>
              <span className="absolute top-4 left-44 size-16 rounded-full border-4 border-forest-900/15" />
              <span className="absolute bottom-6 left-52 size-5 rounded-full bg-forest-900" />
              <div className="absolute right-0 bottom-0 max-w-[15rem] -rotate-3 rounded-2xl bg-forest-900 p-4 text-cream-50 shadow-lift">
                <p className="font-display text-xs font-semibold tracking-widest text-lime-400 uppercase">
                  Безкоштовно
                </p>
                <p className="mt-1.5 font-display text-lg leading-tight font-bold">
                  Онлайн-оцінка за 15 хвилин
                </p>
              </div>
            </div>
          </m.div>

          {/* Вікно чату */}
          <m.div
            {...reveal(0.1)}
            className="rounded-leaf relative overflow-hidden bg-forest-900 shadow-lift"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0 88px, rgb(255 255 255 / 0.025) 88px 176px)',
              }}
            />

            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -left-4 font-display text-[18rem] leading-none font-extrabold text-lime-400/[0.06] select-none max-lg:hidden"
            >
              ?
            </span>

            {/* Шапка чату */}
            <div className="relative flex items-center gap-3 border-b border-cream-50/10 px-5 py-4 sm:px-7">
              <span className="grid size-11 place-items-center rounded-full bg-lime-400 font-display text-sm font-extrabold text-forest-950">
                UG
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-cream-50">
                  UTopiar Garden
                </p>
                <p className="flex items-center gap-1.5 text-xs text-lime-300">
                  <span className="size-1.5 rounded-full bg-lime-400" />
                  на зв'язку
                </p>
              </div>
            </div>

            <ul className="relative space-y-3 p-4 sm:space-y-4 sm:p-7">
              {faq.map((item, index) => {
                const isOpen = index === open;
                return (
                  <li key={item.q} className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${index}`}
                      onClick={() => setOpen(isOpen ? -1 : index)}
                      className={cn(
                        'flex min-h-12 max-w-[92%] items-center gap-3 self-end rounded-[1.25rem] rounded-br-md border-2 px-4 py-2.5 text-left text-[0.9375rem] leading-snug font-medium transition-[background-color,color,border-color,scale] duration-200 active:scale-[0.98] sm:max-w-[80%] sm:text-base lg:text-[1.0625rem]',
                        isOpen
                          ? 'border-lime-400 bg-lime-400 text-forest-950'
                          : 'border-lime-400/40 text-cream-50 hover:border-lime-400',
                      )}
                    >
                      <span>{item.q}</span>
                      <PlusIcon
                        aria-hidden
                        weight="bold"
                        className={cn(
                          'size-4 shrink-0 transition-transform duration-300',
                          isOpen && 'rotate-45',
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={`faq-a-${index}`}
                        className="relative max-w-[92%] self-start rounded-[1.25rem] rounded-bl-md bg-cream-50 px-4 py-3.5 text-ink-900 sm:max-w-[80%] sm:px-5"
                      >
                        {/* Текст з'являється після «друкує…» */}
                        <div className="animate-[fade-up_0.45s_ease-out_0.85s_both]">
                          <p className="leading-relaxed">{item.a}</p>
                          {item.list && (
                            <ul className="mt-2.5 grid gap-1.5">
                              {item.list.map((text) => (
                                <li
                                  key={text}
                                  className="flex items-center gap-2 text-[0.9375rem]"
                                >
                                  <CheckIcon
                                    aria-hidden
                                    weight="bold"
                                    className="size-4 shrink-0 text-forest-600"
                                  />
                                  {text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <span
                          aria-hidden
                          className="absolute top-4 left-4 flex gap-1.5 animate-[gone_0.01s_linear_0.85s_forwards]"
                        >
                          {[0, 1, 2].map((dot) => (
                            <i
                              key={dot}
                              className="size-2 rounded-full bg-forest-600 animate-[typing_0.6s_ease-in-out_both_infinite]"
                              style={{ animationDelay: `${dot * 0.15}s` }}
                            />
                          ))}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
