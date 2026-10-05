'use client';
import { Heart } from 'lucide-react';
import { useWishlist } from './wishlist';

interface Props {
  menuItemId: string;
  dishName: string;
  onSaved?: (dishName: string, listName: string) => void;
}

export function SaveButton({ menuItemId, dishName, onSaved }: Props) {
  const w = useWishlist();
  const wish = w.items.find((i) => i.menu_item_id === menuItemId && !i.id.startsWith('T'));
  const saved = w.saved.has(menuItemId);
  const pending = w.items.some((i) => i.id.startsWith('T') && i.menu_item_id === menuItemId);
  const label = saved ? `Remove ${dishName} from saved dishes` : `Save ${dishName}`;

  return (
    <button
      type="button"
      aria-pressed={saved}
      disabled={!w.enabled || w.loading}
      title={w.enabled ? label : 'Wishlist unavailable in this deployment'}
      onClick={() => {
        if (saved && wish) void w.unsave(wish.id);
        else {
          const list = w.lists.find((l) => l.id === w.defaultListId);
          void w.save(menuItemId);
          if (list) onSaved?.(dishName, list.name);
        }
      }}
      className="sv-heart inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--sv-line)] bg-[var(--sv-elevated)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Heart size={17} fill={saved ? 'currentColor' : 'none'} className={pending ? 'opacity-50' : undefined} />
      <span className="sr-only">{label}</span>
    </button>
  );
}
