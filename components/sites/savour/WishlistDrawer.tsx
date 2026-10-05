'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { ListEditor } from './ListEditor';
import { price } from './DishCardView';
import { useWishlist } from './wishlist';
import type { WishItem, WishlistListRow } from './types';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function WishlistDrawer({ open, onClose }: Props) {
  const w = useWishlist();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);

  // The selected list follows the default once the data arrives, and resets
  // whenever the drawer closes so a reopened panel never points at a deleted id.
  useEffect(() => {
    if (!open) {
      trigger.current?.focus();
      trigger.current = null;
      setActiveListId(null);
      return;
    }
    trigger.current = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
  }, [open]);

  useEffect(() => {
    if (activeListId && !w.lists.some((l) => l.id === activeListId)) setActiveListId(null);
  }, [activeListId, w.lists]);

  if (!open) return null;

  const shown: WishItem[] = activeListId ? w.items.filter((i) => i.list_id === activeListId) : w.items;
  const selected: WishlistListRow | undefined = w.lists.find((l) => l.id === activeListId);
  const countFor = (id: string) => w.items.filter((i) => i.list_id === id).length;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panel.current) return;
    const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const activeEl = document.activeElement as HTMLElement | null;
    if (e.shiftKey && (activeEl === first || activeEl === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && activeEl === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close wishlist" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-black/60" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-title"
        onKeyDown={onKeyDown}
        className="savour absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[var(--sv-line)] bg-[var(--sv-surface)] shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-[var(--sv-line)] px-4 py-3">
          <h2 id="wishlist-title" className="savour-display text-lg font-semibold">
            Saved dishes
          </h2>
          <span className="text-xs text-[var(--sv-muted)]">{w.items.length}</span>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="ml-auto flex items-center gap-1 rounded-md border border-[var(--sv-line)] px-2 py-1 text-xs hover:border-[var(--sv-accent)]"
          >
            <X size={14} /> Close
          </button>
        </div>

        {w.error && (
          <p role="alert" className="border-b border-[var(--sv-accent-deep)] bg-[#2a1f12] px-4 py-2 text-xs">
            {w.error}{' '}
            <button type="button" className="underline" onClick={() => void w.retry()}>
              Retry
            </button>
          </p>
        )}

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="sv-chip" aria-pressed={activeListId === null} onClick={() => setActiveListId(null)}>
              All lists · {w.items.length}
            </button>
            {w.lists.map((l) => (
              <button
                key={l.id}
                type="button"
                className="sv-chip"
                aria-pressed={activeListId === l.id}
                onClick={() => setActiveListId(l.id)}
              >
                {l.name} · {countFor(l.id)}
              </button>
            ))}
          </div>

          {selected && (
            <ListEditor
              list={selected}
              itemCount={countFor(selected.id)}
              onRename={(name) => void w.renameList(selected.id, name)}
              onNote={(note) => void w.setListNote(selected.id, note)}
              onDelete={() => void w.deleteList(selected.id)}
              onCloseList={() => setActiveListId(null)}
            />
          )}

          <NewListForm onCreate={w.createList} onCreated={setActiveListId} />

          {shown.length === 0 ? (
            <div className="mt-2 text-sm text-[var(--sv-muted)]">
              <p>Nothing saved yet. Tap the heart on any dish.</p>
              {!w.enabled && <p className="mt-1">Saving is unavailable in this deployment.</p>}
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--sv-line)]">
              {shown.map((i) => (
                <li key={i.id} className="py-3">
                  {!i.dish ? (
                    <p className="text-sm text-[var(--sv-muted)]">Saving…</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {i.dish.name}
                            <span className="ml-2 tabular-nums text-xs text-[var(--sv-accent)]">{price(i.dish.price)}</span>
                          </p>
                          <a
                            href={`/savour/${i.dish.place_slug}`}
                            className="text-xs text-[var(--sv-muted)] underline-offset-4 hover:text-[var(--sv-accent)] hover:underline"
                          >
                            {i.dish.place_name}
                          </a>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${i.dish.name} from saved dishes`}
                          onClick={() => void w.unsave(i.id)}
                          className="ml-auto shrink-0 rounded-md border border-[var(--sv-line)] p-1.5 hover:border-[var(--sv-nonveg)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={i.tried}
                            onChange={() => void w.toggleTried(i.id)}
                            className="h-3.5 w-3.5 accent-[var(--sv-accent)]"
                          />
                          Tried
                        </label>
                        {w.lists.length > 1 && (
                          <select
                            aria-label={`Move ${i.dish.name} to another list`}
                            value={i.list_id}
                            onChange={(e) => void w.move(i.id, e.target.value)}
                            className="rounded-md border border-[var(--sv-line)] bg-[var(--sv-elevated)] px-1.5 py-1 outline-none focus:border-[var(--sv-accent)]"
                          >
                            {w.lists.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <input
                        aria-label={`Note for ${i.dish.name}`}
                        defaultValue={i.note ?? ''}
                        placeholder="Note — who to bring, what to skip"
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          if (next !== (i.note ?? '').trim()) void w.setNote(i.id, next === '' ? null : next);
                        }}
                        className="w-full rounded-md border border-[var(--sv-line)] bg-[var(--sv-elevated)] px-2 py-1.5 text-xs outline-none placeholder:text-[var(--sv-muted)] focus:border-[var(--sv-accent)]"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function NewListForm({
  onCreate,
  onCreated,
}: {
  onCreate: (name: string) => Promise<string | null>;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        setBusy(true);
        const id = await onCreate(trimmed);
        setBusy(false);
        if (id) {
          setName('');
          onCreated(id);
        }
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New list name"
        aria-label="New list name"
        className="flex-1 rounded-md border border-[var(--sv-line)] bg-[var(--sv-elevated)] px-2 py-1.5 text-xs outline-none placeholder:text-[var(--sv-muted)] focus:border-[var(--sv-accent)]"
      />
      <button type="submit" disabled={busy || !name.trim()} className="sv-chip flex items-center gap-1.5 disabled:opacity-40">
        <Check size={13} /> Add
      </button>
    </form>
  );
}
