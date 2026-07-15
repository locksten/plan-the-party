export function App() {
  return (
    <main className="grid min-h-screen min-w-80 place-items-center bg-[#f4f0e8] p-8 text-[#18212f]">
      <section className="w-full max-w-2xl rounded-3xl border border-[#18212f]/15 bg-white/60 px-8 py-16 text-center shadow-[0_1.5rem_5rem_rgb(50_42_28_/_0.12)] sm:px-20 sm:py-20">
        <p className="mb-3 text-xs font-bold tracking-[0.16em] text-[#a0442c] uppercase">
          Window demo
        </p>
        <h1 className="font-serif text-6xl leading-[0.95] font-medium tracking-[-0.055em] sm:text-8xl">
          Hello, world!
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[#596273] sm:text-xl">
          Your throwaway React SPA is up and running.
        </p>
      </section>
    </main>
  );
}
