/**
 * Єдине джерело правди для контактів і базових даних сайту.
 * Змінюєш значення тут, і вони оновлюються по всьому проєкту.
 */

/* ==========================================================================
   1. СИРІ ЗНАЧЕННЯ: тільки це потрібно міняти
   ========================================================================== */

/** Номер у міжнародному форматі, без пробілів: +380XXXXXXXXX */
const PHONE_E164 = '+380000000000';
/** Як номер виглядає на сайті */
const PHONE_DISPLAY = '+38 (000) 000-00-00';

/** Нік у Telegram без @ */
const TELEGRAM_USERNAME = 'your_username';

/** Номер для Viber і WhatsApp, зазвичай той самий, що й телефон */
const VIBER_NUMBER_E164 = PHONE_E164;
const WHATSAPP_NUMBER_E164 = PHONE_E164;

/* ==========================================================================
   2. ПОХІДНІ ПОСИЛАННЯ: вручну не чіпати
   ========================================================================== */

/** "+380000000000" → "380000000000" (для wa.me потрібні тільки цифри) */
const digitsOnly = (value: string) => value.replace(/\D/g, '');

export type ContactId = 'phone' | 'telegram' | 'viber' | 'whatsapp';

export interface Contact {
  id: ContactId;
  /** Назва для підписів і aria-label */
  label: string;
  /** Що показуємо користувачу */
  display: string;
  /** Куди веде посилання */
  href: string;
  /** Чи відкривати в новій вкладці (для месенджерів так) */
  external: boolean;
}

export const contacts: Record<ContactId, Contact> = {
  phone: {
    id: 'phone',
    label: 'Зателефонувати',
    display: PHONE_DISPLAY,
    href: `tel:${PHONE_E164}`,
    external: false,
  },
  telegram: {
    id: 'telegram',
    label: 'Написати в Telegram',
    display: `@${TELEGRAM_USERNAME}`,
    href: `https://t.me/${TELEGRAM_USERNAME}`,
    external: true,
  },
  viber: {
    id: 'viber',
    label: 'Написати у Viber',
    display: PHONE_DISPLAY,
    href: `viber://chat?number=${encodeURIComponent(VIBER_NUMBER_E164)}`,
    external: false,
  },
  whatsapp: {
    id: 'whatsapp',
    label: 'Написати у WhatsApp',
    display: PHONE_DISPLAY,
    href: `https://wa.me/${digitsOnly(WHATSAPP_NUMBER_E164)}`,
    external: true,
  },
};

/** Порядок, у якому контакти показуються в UI */
export const contactList: Contact[] = [
  contacts.phone,
  contacts.telegram,
  contacts.viber,
  contacts.whatsapp,
];

/* ==========================================================================
   3. БРЕНД (заглушка до появи логотипу)
   ========================================================================== */

export const brand = {
  name: 'Зелений Двір',
  tagline: 'Доглянута територія без клопоту',
} as const;

/* ==========================================================================
   4. БІЗНЕС
   ========================================================================== */

export const business = {
  city: 'Ваше місто',
  serviceArea: 'Місто та передмістя',
  workHours: 'Щодня, 8:00–20:00',
} as const;

/* ==========================================================================
   5. НАВІГАЦІЯ (якорі на секції сторінки)
   ========================================================================== */

export interface NavItem {
  label: string;
  href: `#${string}`;
}

export const navigation: NavItem[] = [
  { label: 'Послуги', href: '#services' },
  { label: 'Роботи', href: '#works' },
  { label: 'Як працюємо', href: '#steps' },
  { label: 'Відгуки', href: '#reviews' },
  { label: 'Питання', href: '#faq' },
];
