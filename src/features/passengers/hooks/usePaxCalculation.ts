import { useSearchStore } from '@/stores/useSearchStore';

export function usePaxCalculation() {
  const pax = useSearchStore((s) => s.pax);
  const getPricePerPax = useSearchStore((s) => s.getPricePerPax);
  const getTotalPrice = useSearchStore((s) => s.getTotalPrice);

  const pricePerPax = getPricePerPax();
  const totalPrice = getTotalPrice();

  const summary = buildSummary(pax.adults, pax.children);

  return { pax, pricePerPax, totalPrice, summary };
}

function buildSummary(adults: number, children: { age: number }[]): string {
  const parts: string[] = [];
  parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
  if (children.length > 0) {
    const ages = children.map((c) => c.age).join(', ');
    parts.push(`${children.length} child${children.length !== 1 ? 'ren' : ''} (age ${ages})`);
  }
  return parts.join(' + ');
}
