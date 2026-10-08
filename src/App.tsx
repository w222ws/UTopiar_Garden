import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { HowItWorks } from './components/sections/HowitWorks';
import { Reviews } from './components/sections/Reviews';
import { Faq } from './components/sections/Faq';
import { Works } from './components/sections/Works';
import { Services } from './components/sections/Services';
import { navigation } from './data/site';

/**
 * Секции после Hero пока временные заглушки, чтобы проверить шапку (скролл и якоря).
 * Дальше заменим на реальные секции.
 */
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        <Services />
        <HowItWorks />
        <Works />
        <Reviews />
        <Faq />

        {navigation
          .filter(
            (item) =>
              item.href !== '#services' &&
              item.href !== '#steps' &&
              item.href !== '#works' &&
              item.href !== '#faq' &&
              item.href !== '#reviews',
          )
          .map((item) => (
            <section
              key={item.href}
              id={item.href.slice(1)}
              className="grid min-h-[60svh] place-items-center border-t border-forest-900/10 px-4"
            >
              <h2 className="text-h2">{item.label}</h2>
            </section>
          ))}
      </main>
      <Footer />
    </>
  );
}
