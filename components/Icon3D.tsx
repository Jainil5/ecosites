import type { LucideIcon } from 'lucide-react';

interface Icon3DProps {
  icon: LucideIcon;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Accent-lit slab with the glyph raised on the Z axis. Needs a `.scene`
 * perspective ancestor — or a TiltCard, which already provides one.
 */
export function Icon3D({ icon: Icon, size = 'md', className = '' }: Icon3DProps) {
  return (
    <span className={`scene grid w-fit ${className}`}>
      <span className={size === 'sm' ? 'plinth plinth-sm' : 'plinth'}>
        <Icon
          aria-hidden
          className={`plinth-icon ${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} text-accent`}
        />
      </span>
    </span>
  );
}
