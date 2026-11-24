export function Legal({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <section className="marble py-[clamp(3rem,7vw,6rem)]"><div className="wrap !max-w-4xl">
      <h1 className="text-[clamp(1.900rem,4vw,3rem)]">{title}</h1><span aria-hidden className="mt-5 block h-[3px] w-24 rounded bg-primary" />
      {sections.map(([h, p]) => <div key={h} className="mt-9"><h2 className="text-xl">{h}</h2><p className="mt-3 text-lg leading-relaxed text-[#475467]">{p}</p></div>)}
    </div></section>
  );
}
