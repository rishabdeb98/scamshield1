export function HeroSection() {
  return (
    <section className="pt-10 pb-8 sm:pt-12 sm:pb-10">
      <div className="max-w-3xl">
        <h1
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] leading-[1.15]"
          style={{ textWrap: 'balance' }}
        >
          Don&apos;t Trust Every Message. Verify It.
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-[#A7B4C7] leading-relaxed max-w-2xl">
          Analyse suspicious messages and links before you click.
        </p>
      </div>
    </section>
  );
}
