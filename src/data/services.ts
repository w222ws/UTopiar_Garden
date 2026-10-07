/* Послуги та ціни. Правити тут: компонент Services нічого не рахує, лише показує. */

export interface ServiceItem {
  name: string;
  /** Число ціни. Якщо немає, показується "Індивідуально" */
  price?: number;
  /** true → перед ціною пишемо "від" */
  from?: boolean;
  /** Одиниця: "м.п.", "м²", "сотка" */
  unit?: string;
  /** Дрібний рядок під назвою */
  note?: string;
}

export type IconName = 'plant' | 'grass' | 'broom' | 'calendar';

export interface ServiceGroup {
  id: string;
  /** Коротка назва для вкладки на телефоні */
  short: string;
  title: string;
  /** Рядок під заголовком (необов'язково) */
  subtitle?: string;
  icon: IconName;
  items: ServiceItem[];
  /** Для абонемента: що входить */
  includes?: string[];
}

export const MIN_VISIT_PRICE = 2000;

export const priceNote =
  'Вказані ціни є орієнтовними. Кінцева вартість залежить від обсягу робіт, стану насаджень та рельєфу.';

export const serviceGroups: ServiceGroup[] = [
  {
    id: 'plants',
    short: 'Рослини',
    title: 'Топіарна стрижка та догляд за рослинами',
    icon: 'plant',
    items: [
      {
        name: "Чистка, зв'язка та стрижка туй",
        price: 200,
        from: true,
        unit: 'м.п.',
      },
      { name: 'Стрижка живих огорож', price: 80, from: true, unit: 'м²' },
      {
        name: 'Обрізка плодових та декоративних дерев',
        price: 150,
        from: true,
        unit: 'м.п.',
      },
      {
        name: 'Комплексна обробка від хвороб та шкідників',
        price: 500,
        unit: 'сотка',
        note: 'або 1 000 грн за 10 л бакової суміші',
      },
      {
        name: 'Підживлення рослин та газону',
        price: 200,
        from: true,
        unit: 'сотка',
        note: 'внесення добрив, + вартість матеріалу',
      },
    ],
  },
  {
    id: 'lawn',
    short: 'Газон',
    title: 'Догляд за газоном',
    icon: 'grass',
    items: [
      {
        name: 'Регулярний покос газону',
        price: 400,
        from: true,
        unit: 'сотка',
        note: 'газонокосаркою',
      },
      {
        name: 'Скарифікація та аерація газону',
        price: 1000,
        from: true,
        unit: 'сотка',
        note: 'вичісування / прорізання',
      },
      {
        name: "Покос бур'янів та занедбаних ділянок",
        price: 200,
        from: true,
        unit: 'сотка',
        note: 'тримером',
      },
      {
        name: 'Посів газону',
        price: 250,
        from: true,
        unit: 'м²',
        note: 'з підготовкою ґрунту, + вартість матеріалу',
      },
    ],
  },
  {
    id: 'territory',
    short: 'Територія',
    title: 'Прибирання та благоустрій території',
    icon: 'broom',
    items: [
      {
        name: 'Миття тротуарної плитки, парканів та споруд',
        price: 30,
        from: true,
        unit: 'м²',
        note: 'високим тиском',
      },
      {
        name: 'Прибирання території та розчищення ділянок',
        note: 'розраховується індивідуально',
      },
    ],
  },
  {
    id: 'season',
    short: 'Під ключ',
    title: 'Сезонний абонемент',
    subtitle: 'Комплексний догляд «Під ключ»',
    icon: 'calendar',
    items: [
      {
        name: 'Регулярне обслуговування ділянки на постійній основі',
        note: 'розраховується індивідуально після огляду ділянки',
      },
    ],
    includes: [
      'Регулярний покос',
      'Топіарна стрижка',
      'Сезонна хімія',
      'Підживлення',
      'Підтримка ідеального порядку',
    ],
  },
];
