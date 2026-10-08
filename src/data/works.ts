/*
  Роботи.

  Поки фото немає, сайт показує намальовані заглушки, щоб було видно структуру.
  Коли з'являться фото, кладеш їх у src/assets/works/ (формат AVIF), і заглушка
  сама замінюється на фото. Нічого в коді міняти не треба.

  Імена файлів (число = id роботи з workSlots нижче):
    01-before.avif + 01-after.avif   пара «до / після» (слайдер)
    02.avif                          одне фото

  Хочеш більше плиток: допиши рядок у workSlots.
*/

export type WorkKind = 'compare' | 'single';

export interface WorkSlot {
  id: string;
  kind: WorkKind;
  /** Мітка категорії на плитці: Рослини / Газон / Територія */
  tag: string;
  /** Підпис (необов'язково), наприклад "Стрижка туй, Дніпро" */
  caption?: string;
}

export const workSlots: WorkSlot[] = [
  { id: '01', kind: 'compare', tag: 'Газон' },
  { id: '02', kind: 'single', tag: 'Рослини' },
  { id: '03', kind: 'compare', tag: 'Рослини' },
  { id: '04', kind: 'single', tag: 'Територія' },
  { id: '05', kind: 'compare', tag: 'Територія' },
  { id: '06', kind: 'single', tag: 'Газон' },
];

export interface Work extends WorkSlot {
  before?: string;
  after?: string;
  single?: string;
}

const files = import.meta.glob('../assets/works/*.avif', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const photos = new Map<
  string,
  { before?: string; after?: string; single?: string }
>();

for (const [path, url] of Object.entries(files)) {
  const match = path.match(/(\d+)(?:-(before|after))?\.avif$/);
  if (!match) continue;
  const [, id, kind] = match;
  const entry = photos.get(id) ?? {};
  if (kind === 'before') entry.before = url;
  else if (kind === 'after') entry.after = url;
  else entry.single = url;
  photos.set(id, entry);
}

const slots = [...workSlots];

// Фото з id, якого немає в workSlots, теж показуємо (додаємо плитку в кінець)
for (const id of photos.keys()) {
  if (!slots.some((slot) => slot.id === id)) {
    const entry = photos.get(id)!;
    slots.push({
      id,
      kind: entry.before && entry.after ? 'compare' : 'single',
      tag: '',
    });
  }
}

export const works: Work[] = slots
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  .map((slot) => ({ ...slot, ...photos.get(slot.id) }));
