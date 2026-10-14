// Decorative layered background: deep canvas, perspective grid planes, three
// coloured light sources, and film grain so large dark areas read as surface
// rather than emptiness. aria-hidden; fixed behind every brand route.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function GridBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* deep canvas: darker at the edges, lit where the content sits */}
      <div className="absolute inset-0 bg-deep" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,_#0F172A_0%,_transparent_60%)]" />

      {/* three light sources, one per brand hue, kept low so they read as
          lighting rather than coloured smudges */}
      <div className="absolute -left-32 -top-24 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-accent/12 blur-[110px]" />
      <div className="absolute right-[-8rem] top-1/4 h-96 w-96 animate-float-slow rounded-full bg-cyan-400/8 blur-[120px] [animation-delay:1.5s]" />
      <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 animate-float-slow rounded-full bg-violet-500/8 blur-[120px] [animation-delay:3s]" />

      {/* tilted 3D floor grid */}
      <div className="absolute inset-x-[-25%] bottom-[-10%] top-1/2 [perspective:900px]">
        <div className="h-full w-full origin-bottom [transform:rotateX(72deg)] bg-grid-fade bg-grid [mask-image:linear-gradient(to_top,_black,_transparent_60%)] opacity-50" />
      </div>

      {/* mirrored ceiling: the same plane overhead turns a floor into a horizon */}
      <div className="absolute inset-x-[-25%] left-0 right-0 top-[-10%] h-1/2 [perspective:900px]">
        <div className="h-full w-full origin-top [transform:rotateX(-72deg)] bg-grid-fade bg-grid [mask-image:linear-gradient(to_bottom,_black,_transparent_66%)] opacity-20" />
      </div>

      {/* grain last so it sits over the lit layers */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  );
}
