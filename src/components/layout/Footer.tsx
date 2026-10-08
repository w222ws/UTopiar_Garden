import { ArrowUpIcon, ClockIcon, MapPinIcon } from '@phosphor-icons/react';
import { FaTelegram, FaViber, FaWhatsapp } from 'react-icons/fa6';
import { brand, business, contacts, navigation } from '../../data/site';

/* Автор сайту. Вистав свій Telegram у посилання нижче. */
const DEVELOPER = {
  name: 'Tarasov Kyrylo',
  telegram: 'https://t.me/your_telegram',
};

const heading =
  'font-display text-xs font-semibold tracking-widest text-cream-50/50 uppercase';
const link =
  'inline-flex min-h-11 items-center gap-3 text-cream-100/85 transition-colors hover:text-lime-400';

const messengers = [
  { c: contacts.telegram, name: 'Telegram', Icon: FaTelegram },
  { c: contacts.viber, name: 'Viber', Icon: FaViber },
  { c: contacts.whatsapp, name: 'WhatsApp', Icon: FaWhatsapp },
];

/*
  Футер: «пагорб» зверху, великий телефон, розділи, контакти, права й автор сайту.
  Стоїть у App.tsx після </main>. У index.css в body більше немає запасу знизу,
  тому футер лягає рівно в нижній край екрана.
*/
export function Footer() {
  return (
    <footer className="relative overflow-hidden rounded-t-[2rem] bg-forest-950 pb-[env(safe-area-inset-bottom)] text-cream-50 sm:rounded-t-[3rem]">
      {/* Пагорби й сонце: статичні фігури, без анімації */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
      >
        <span className="absolute -top-24 right-[12%] size-44 rounded-full bg-lime-400/90" />
        <span className="absolute -top-16 -left-[10%] h-52 w-[70%] rounded-[50%] bg-forest-900" />
        <span className="absolute -top-20 -right-[15%] h-56 w-[75%] rounded-[50%] bg-forest-800/70" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Телефон великою кнопкою */}
        <a
          href={contacts.phone.href}
          aria-label={`${contacts.phone.label} ${contacts.phone.display}`}
          className="group flex items-center justify-between gap-4 rounded-[1.5rem] bg-lime-400 px-5 py-4 text-forest-950 shadow-cta transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98] sm:px-8 sm:py-6"
        >
          <span>
            <span className="block font-display text-xs font-semibold tracking-widest uppercase opacity-70">
              Зателефонувати
            </span>
            <span className="mt-1 block font-display text-[clamp(1.05rem,5.1vw,3rem)] leading-none whitespace-nowrap font-extrabold tracking-tight tabular-nums">
              {contacts.phone.display}
            </span>
          </span>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-forest-950 text-lime-400 transition-transform duration-300 group-hover:rotate-45 sm:size-14">
            <ArrowUpIcon
              aria-hidden
              weight="bold"
              className="size-6 rotate-45"
            />
          </span>
        </a>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1.1fr_1.1fr] lg:gap-8">
          <div className="col-span-full flex items-center justify-between gap-4 lg:col-span-1 lg:block">
            <div>
              <a
                href="#"
                className="font-display text-2xl font-extrabold tracking-tight"
              >
                UTopiar <span className="text-lime-400">Garden</span>
              </a>
              <p className="mt-2 max-w-xs text-cream-100/70">{brand.tagline}</p>
            </div>
            <button
              type="button"
              aria-label="Нагору"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-lime-400/60 text-lime-400 transition-[background-color,color,scale] duration-200 hover:bg-lime-400 hover:text-forest-950 active:scale-90 lg:hidden"
            >
              <ArrowUpIcon aria-hidden weight="bold" className="size-5" />
            </button>
          </div>

          <nav aria-label="Розділи сайту">
            <p className={heading}>Розділи</p>
            <ul className="mt-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={link}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className={heading}>Месенджери</p>
            <ul className="mt-3">
              {messengers.map(({ c, name, Icon }) => (
                <li key={name}>
                  <a
                    href={c.href}
                    {...(c.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className={link}
                  >
                    <Icon aria-hidden className="size-5 text-lime-400" />
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className={heading}>Де і коли</p>
            <ul className="mt-3 grid gap-3 text-cream-100/85 max-sm:grid-cols-2">
              <li className="flex items-start gap-3">
                <MapPinIcon
                  aria-hidden
                  weight="bold"
                  className="mt-0.5 size-5 shrink-0 text-lime-400"
                />
                <span>
                  {business.city}
                  <span className="block text-sm text-cream-50/55">
                    {business.serviceArea}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ClockIcon
                  aria-hidden
                  weight="bold"
                  className="mt-0.5 size-5 shrink-0 text-lime-400"
                />
                {business.workHours}
              </li>
            </ul>
          </div>
        </div>

        {/* Права і автор */}
        <div className="mt-12 flex flex-col gap-3 border-t border-cream-50/10 py-6 text-sm text-cream-50/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} UTopiar Garden. Усі права захищено.
          </p>
          <p className="flex flex-wrap items-center gap-x-2">
            Розробка сайту:
            <a
              href={DEVELOPER.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-1.5 font-display font-semibold text-cream-50 transition-colors hover:text-lime-400"
            >
              <FaTelegram aria-hidden className="size-4 text-lime-400" />
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>

      {/* Смуга скошеного газону по самому низу */}
      <div
        aria-hidden
        className="h-2.5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #b9e04a 0 40px, #8ab72a 40px 80px)',
        }}
      />
    </footer>
  );
}
