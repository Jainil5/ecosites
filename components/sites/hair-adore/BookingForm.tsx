'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ShieldCheck, X } from 'lucide-react';
import { stylists } from './data';

const fieldClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-[#C1613C] focus-visible:ring-2 focus-visible:ring-[#C1613C]/40';
const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-stone-500';

const categories = ["Women's Hair & Beauty", "Men's Grooming", 'Unisex / Spa', 'Bridal / Event Makeup'];
const serviceOptions = [
  'Haircut & Styling',
  'Hair Color / Balayage',
  'Keratin / Smoothing',
  'Hair Spa / Scalp Treatment',
  'Facial / Skin Care',
];
const slots = ['10:00 AM', '11:30 AM', '01:00 PM', '03:00 PM', '05:00 PM', '06:30 PM'];

export function BookingForm() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    submitRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          e.currentTarget.reset();
          setOpen(true);
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="ha-name">Full Name</label>
            <input id="ha-name" name="name" type="text" required className={fieldClass} placeholder="Your name" />
          </div>
          <div>
            <label className={labelClass} htmlFor="ha-phone">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-stone-300 bg-stone-50 px-3 text-sm text-stone-500">
                +91
              </span>
              <input
                id="ha-phone"
                name="phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                className={`${fieldClass} rounded-l-none`}
                placeholder="9876543210"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="ha-category">Category</label>
            <select id="ha-category" name="category" required className={fieldClass} defaultValue="">
              <option value="" disabled>Choose</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ha-service">Service</label>
            <select id="ha-service" name="service" required className={fieldClass} defaultValue="">
              <option value="" disabled>Choose</option>
              {serviceOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ha-stylist">Stylist</label>
            <select id="ha-stylist" name="stylist" className={fieldClass} defaultValue="any">
              <option value="any">Any Available</option>
              {stylists.map((s) => (
                <option key={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="ha-date">Date</label>
            <input id="ha-date" name="date" type="date" required min={today} className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ha-time">Time</label>
            <select id="ha-time" name="time" required className={fieldClass} defaultValue="">
              <option value="" disabled>Available slots</option>
              {slots.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-1 text-center">
          <button
            type="submit"
            ref={submitRef}
            className="focus-ring w-full cursor-pointer rounded-lg bg-[#C1613C] px-10 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 hover:bg-[#9E4A2B] sm:w-auto"
          >
            Confirm Booking
          </button>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck aria-hidden className="h-4 w-4 text-[#6B7F6E]" /> No advance payment required
          </p>
        </div>
      </form>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ha-modal-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xl outline-none"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#C1613C]/15">
              <Check aria-hidden className="h-8 w-8 text-[#C1613C]" />
            </div>
            <h3 id="ha-modal-title" className="font-serif text-2xl text-stone-900">Booking Confirmed!</h3>
            <p className="mt-2 text-sm text-stone-500">
              Thank you for choosing Hair Adore. We&apos;ll send a confirmation to your WhatsApp shortly.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#C1613C] py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#9E4A2B]"
            >
              <X aria-hidden className="h-4 w-4" /> Done
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
