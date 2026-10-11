/*
  Роботи. Заглушок немає: що лежить у src/assets/works/, те й показується.

  Формат усіх файлів: AVIF.

  До / після (один слайдер):
    src/assets/works/before.avif
    src/assets/works/after.avif
  Обидва фото в одному кадрі й одного розміру, щоб лінія збігалася.

  Галерея (до 10 фото, порядок за номером):
    src/assets/works/01.avif
    src/assets/works/02.avif
    ...
    src/assets/works/10.avif

  Немає before/after: слайдера в секції не буде.
  Немає фото галереї: галереї не буде. Секція сама зникне, якщо порожня.
*/

const files = import.meta.glob('../assets/works/*.avif', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const byName = (name: string) =>
  Object.entries(files).find(([path]) => path.endsWith(`/${name}.avif`))?.[1];

const before = byName('before');
const after = byName('after');

export const compare = before && after ? { before, after } : null;

export const gallery: string[] = Object.entries(files)
  .map(([path, url]) => ({ n: path.match(/\/(\d+)\.avif$/)?.[1], url }))
  .filter((item): item is { n: string; url: string } => Boolean(item.n))
  .sort((a, b) => Number(a.n) - Number(b.n))
  .map((item) => item.url);
