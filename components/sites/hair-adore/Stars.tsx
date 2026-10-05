import { Star } from 'lucide-react';

export function Stars({ n = 5, className = '' }: { n?: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label={`${n} out of 5 stars`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={`h-3.5 w-3.5 ${i < n ? 'fill-[#C1613C] text-[#C1613C]' : 'text-stone-300'}`}
        />
      ))}
    </div>
  );
}
