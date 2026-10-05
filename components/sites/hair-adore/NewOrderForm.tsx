'use client';

import { useMemo, useState } from 'react';
import { UserPlus, UserMinus, Save, MessageCircle, Mail } from 'lucide-react';
import { services, stylists, type ServiceCategory } from './data';
import {
  categoryLabels, formatINR, newOrderId, orderTotal,
  buildWhatsAppUrl, buildMailtoUrl,
  type Gender, type Order,
} from './orders';

const categoryOrder: ServiceCategory[] = ['women', 'unisex', 'men'];

interface DraftPerson {
  name: string;
  gender: Gender;
  services: string[];
}

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-[#C1613C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C1613C]/40';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500';

function allServiceKeys(people: DraftPerson[]): string[] {
  return people.flatMap((p) => p.services);
}

export function NewOrderForm({ onSave }: { onSave: (order: Order) => void }) {
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [people, setPeople] = useState<DraftPerson[]>([{ name: '', gender: 'Female', services: [] }]);
  const [team, setTeam] = useState<string[]>([]);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const total = useMemo(() => orderTotal(allServiceKeys(people)), [people]);
  const phoneOk = customer.phone.replace(/\D/g, '').length >= 10;
  const hasServices = allServiceKeys(people).length > 0;
  const valid = customer.name.trim() !== '' && phoneOk && hasServices;

  const setPerson = (i: number, patch: Partial<DraftPerson>) =>
    setPeople((prev) => prev.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const toggleService = (i: number, key: string) =>
    setPeople((prev) =>
      prev.map((p, j) =>
        j === i
          ? { ...p, services: p.services.includes(key) ? p.services.filter((s) => s !== key) : [...p.services, key] }
          : p,
      ),
    );

  const addPerson = () => setPeople((prev) => [...prev, { name: '', gender: 'Male', services: [] }]);
  const removePerson = (i: number) => setPeople((prev) => prev.filter((_, j) => j !== i));

  const toggleTeam = (name: string) =>
    setTeam((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]));

  const buildOrder = (): Order => ({
    id: newOrderId(),
    date: new Date().toISOString().slice(0, 10),
    customer: { ...customer },
    people: people
      .filter((p) => p.services.length > 0)
      .map((p) => ({ ...p, name: p.name.trim() || 'Walk-in' })),
    team,
    total,
  });

  const save = (): Order | null => {
    if (!valid) return null;
    const order = buildOrder();
    onSave(order);
    setSavedMsg(`Order ${order.id} saved · ${formatINR(order.total)}`);
    return order;
  };

  const handleSave = () => {
    if (save()) {
      setCustomer({ name: '', phone: '', email: '' });
      setPeople([{ name: '', gender: 'Female', services: [] }]);
      setTeam([]);
    }
  };

  const handleWhatsapp = () => {
    const order = save();
    if (order) window.open(buildWhatsAppUrl(order), '_blank', 'noopener');
  };

  const handleEmail = () => {
    const order = save();
    if (order && order.customer.email) window.location.href = buildMailtoUrl(order);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Customer */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 font-serif text-xl text-stone-900">Customer Details</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="ro-name">Name *</label>
            <input id="ro-name" className={inputClass} value={customer.name} placeholder="e.g. Sneha Kulkarni"
              onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ro-phone">Mobile *</label>
            <input id="ro-phone" className={inputClass} inputMode="tel" value={customer.phone} placeholder="98220 11223"
              onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass} htmlFor="ro-email">Email</label>
            <input id="ro-email" className={inputClass} type="email" value={customer.email} placeholder="name@example.com"
              onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* People */}
      {people.map((person, i) => (
        <div key={i} className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-stone-900">
              Person {i + 1}
              <span className="ml-2 text-xs font-sans uppercase tracking-wider text-stone-500">{person.gender}</span>
            </h3>
            {people.length > 1 && (
              <button
                type="button"
                onClick={() => removePerson(i)}
                className="focus-ring inline-flex items-center gap-1 rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-500 hover:border-red-300 hover:text-red-600"
              >
                <UserMinus aria-hidden className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`rp-name-${i}`}>Name</label>
              <input id={`rp-name-${i}`} className={inputClass} value={person.name} placeholder="Guest name"
                onChange={(e) => setPerson(i, { name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass} htmlFor={`rp-gender-${i}`}>Gender</label>
              <select id={`rp-gender-${i}`} className={inputClass} value={person.gender}
                onChange={(e) => setPerson(i, { gender: e.target.value as Gender })}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            {categoryOrder.map((cat) => (
              <div key={cat}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9E4A2B]">
                  {categoryLabels[cat]}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {services[cat].map((s) => {
                    const key = `${cat}::${s.name}`;
                    const checked = person.services.includes(key);
                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          checked ? 'border-[#C1613C] bg-[#C1613C]/5 text-stone-900' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[#C1613C]"
                            checked={checked}
                            onChange={() => toggleService(i, key)}
                          />
                          {s.name}
                        </span>
                        <span className="whitespace-nowrap text-xs font-semibold text-[#9E4A2B]">{formatINR(s.amount)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addPerson}
        className="focus-ring inline-flex items-center gap-2 rounded-full border border-dashed border-[#C1613C]/50 px-5 py-2 text-sm font-medium text-[#9E4A2B] transition-colors hover:bg-[#C1613C]/5"
      >
        <UserPlus aria-hidden className="h-4 w-4" /> Add another guest (couple / pair offer)
      </button>

      {/* Team members */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="mb-1 font-serif text-xl text-stone-900">Team Members Who Worked</h3>
        <p className="mb-4 text-xs text-stone-500">Select everyone who handled services in this order — used in analytics.</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Team members who worked on this order">
          {stylists.map((s) => {
            const checked = team.includes(s.name);
            return (
              <label
                key={s.name}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                  checked ? 'border-[#C1613C] bg-[#C1613C]/10 text-[#9E4A2B]' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#C1613C]"
                  checked={checked}
                  onChange={() => toggleTeam(s.name)}
                />
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-stone-500">{s.role}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Total + actions */}
      <div className="sticky bottom-4 z-30 rounded-2xl border border-[#C1613C]/30 bg-white/95 p-5 shadow-[0_18px_40px_-18px_rgba(43,33,24,0.45)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">Order Total</p>
            <p className="font-serif text-3xl font-bold text-[#9E4A2B]">{formatINR(total)}</p>
            {!valid && (
              <p className="text-xs text-stone-500">
                {customer.name.trim() ? (!phoneOk ? 'Enter a valid mobile number' : 'Select at least one service') : 'Customer name & mobile are required'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button" disabled={!valid} onClick={handleSave}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#C1613C] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9E4A2B] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save aria-hidden className="h-4 w-4" /> Save Order
            </button>
            <button
              type="button" disabled={!valid} onClick={handleWhatsapp}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1fb257] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MessageCircle aria-hidden className="h-4 w-4" /> WhatsApp Bill
            </button>
            <button
              type="button" disabled={!valid || !customer.email.includes('@')} onClick={handleEmail}
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#C1613C]/40 px-6 py-2.5 text-sm font-semibold text-[#9E4A2B] transition-colors hover:bg-[#C1613C]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Mail aria-hidden className="h-4 w-4" /> Email Receipt
            </button>
          </div>
        </div>
        {savedMsg && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">{savedMsg}</p>}
      </div>
    </div>
  );
}
