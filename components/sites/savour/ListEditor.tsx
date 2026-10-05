'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { WishlistListRow } from './types';

interface Props {
  list: WishlistListRow;
  itemCount: number;
  onRename: (name: string) => void;
  onNote: (note: string | null) => void;
  onDelete: () => void;
  onCloseList: () => void;
}

export function ListEditor({ list, itemCount, onRename, onNote, onDelete, onCloseList }: Props) {
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draft, setDraft] = useState(list.name);
  const renameInput = useRef<HTMLInputElement>(null);

  // list.id changes when a different list is selected: drop any half-typed state.
  useEffect(() => {
    setRenaming(false);
    setConfirming(false);
    setDraft(list.name);
  }, [list.id, list.name]);

  useEffect(() => {
    if (renaming) renameInput.current?.focus();
  }, [renaming]);

  const commit = () => {
    const next = draft.trim();
    setRenaming(false);
    if (next && next !== list.name) onRename(next);
    else setDraft(list.name);
  };

  return (
    <div className="rounded-lg border border-[var(--sv-line)] bg-[var(--sv-elevated)] p-3">
      <div className="flex items-center gap-2">
        {renaming ? (
          <>
            <input
              ref={renameInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') {
                  setDraft(list.name);
                  setRenaming(false);
                }
              }}
              aria-label="List name"
              className="flex-1 rounded-md border border-[var(--sv-accent)] bg-[var(--sv-surface)] px-2 py-1 text-sm outline-none"
            />
            <button type="button" onClick={commit} aria-label="Save list name" className="text-[var(--sv-accent)]">
              <Check size={15} />
            </button>
          </>
        ) : (
          <>
            <h3 className="savour-display text-base font-semibold">{list.name}</h3>
            {list.is_default && <span className="text-[0.7rem] text-[var(--sv-muted)]">default</span>}
            <button
              type="button"
              onClick={() => setRenaming(true)}
              aria-label={`Rename ${list.name}`}
              className="ml-1 text-[var(--sv-muted)] hover:text-[var(--sv-accent)]"
            >
              <Pencil size={13} />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onCloseList}
          aria-label="Show all lists"
          className="ml-auto text-[var(--sv-muted)] hover:text-[var(--sv-accent)]"
        >
          <X size={15} />
        </button>
      </div>

      <input
        aria-label={`Note for ${list.name}`}
        defaultValue={list.note ?? ''}
        placeholder="Note for this list — occasion, dates, who is coming"
        onBlur={(e) => {
          const next = e.target.value.trim();
          if (next !== (list.note ?? '').trim()) onNote(next === '' ? null : next);
        }}
        className="mt-2 w-full rounded-md border border-[var(--sv-line)] bg-[var(--sv-surface)] px-2 py-1.5 text-xs outline-none placeholder:text-[var(--sv-muted)] focus:border-[var(--sv-accent)]"
      />

      <div className="mt-2 flex items-center gap-2 text-xs">
        {confirming ? (
          <span className="flex flex-wrap items-center gap-2">
            Delete this list and its {itemCount} saved dishes?
            <button type="button" onClick={onDelete} className="rounded-md border border-[var(--sv-nonveg)] px-2 py-0.5">
              Delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="underline text-[var(--sv-muted)]">
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={list.is_default}
            title={list.is_default ? 'The default list cannot be deleted.' : undefined}
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1 text-[var(--sv-muted)] enabled:hover:text-[var(--sv-nonveg)] disabled:opacity-40"
          >
            <Trash2 size={13} /> Delete list
          </button>
        )}
      </div>
    </div>
  );
}
