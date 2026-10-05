import { services, type Service, type ServiceCategory } from './data';
import { Reveal } from './Reveal';

const sections: { id: ServiceCategory; label: string; caption: string }[] = [
  { id: 'women', label: 'For Her', caption: 'Cuts, colour & bridal artistry' },
  { id: 'unisex', label: 'For Everyone', caption: 'Signature treatments & grooming rituals' },
  { id: 'men', label: 'For Him', caption: 'Precision cuts, fades & men’s grooming' },
];

function ServiceCard({ s }: { s: Service }) {
  return (
    <div className="group preserve-3d flex items-end justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-[#C1613C]/40 hover:shadow-[0_24px_50px_-18px_rgba(43,33,24,0.35)] hover:[transform:perspective(700px)_translateY(-5px)_rotateX(7deg)]">
      <div className="[transform:translateZ(28px)]">
        <h3 className="font-serif text-lg text-stone-900">
          {s.name}
          {s.badge ? (
            <span className="ml-2 inline-block rounded-full bg-[#C1613C]/10 px-2.5 py-0.5 align-middle font-sans text-[10px] font-semibold uppercase tracking-wider text-[#9E4A2B]">
              {s.badge}
            </span>
          ) : null}
        </h3>
        <p className="mt-0.5 text-xs text-stone-500">{s.note}</p>
      </div>
      <div className="whitespace-nowrap font-serif text-lg font-semibold text-[#9E4A2B] [transform:translateZ(42px)]">
        {s.price}
      </div>
    </div>
  );
}

export function ServiceMenu() {
  return (
    <div className="grid max-w-6xl gap-12 items-start lg:grid-cols-3 lg:gap-8 mx-auto">
      {sections.map((section) => (
        <Reveal key={section.id}>
          <div>
            <div className="mb-6 flex flex-col gap-x-4 gap-y-1">
              <div className="flex items-baseline gap-4">
                <h3 className="font-serif text-2xl text-stone-900 sm:text-3xl">{section.label}</h3>
                <span className="h-px min-w-8 flex-1 bg-[#C1613C]/20" />
              </div>
              <span className="text-xs uppercase tracking-widest text-[#9E4A2B]">{section.caption}</span>
            </div>
            <div className="ha-perspective grid grid-cols-1 gap-4">
              {services[section.id].map((s) => (
                <ServiceCard key={s.name} s={s} />
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
