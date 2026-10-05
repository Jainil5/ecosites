// Decorative layered background: perspective grid + floating glow orbs.
// aria-hidden so screen readers skip it; fixed so it sits behind all routes.
export function GridBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base radial wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.10),_transparent_55%)]" />

      {/* tilted 3D floor grid */}
      <div className="absolute inset-x-[-25%] bottom-[-10%] top-1/2 [perspective:900px]">
        <div className="h-full w-full origin-bottom [transform:rotateX(72deg)] bg-grid-fade bg-grid [mask-image:linear-gradient(to_top,_black,_transparent_65%)] opacity-60" />
      </div>

      {/* floating glow orbs */}
      <div className="absolute -left-20 top-24 h-72 w-72 animate-float-slow rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute right-[-6rem] top-1/3 h-80 w-80 animate-float-slow rounded-full bg-cyan-500/15 blur-3xl [animation-delay:1.5s]" />
      <div className="absolute bottom-10 left-1/3 h-72 w-72 animate-float-slow rounded-full bg-violet-500/15 blur-3xl [animation-delay:3s]" />
    </div>
  );
}
