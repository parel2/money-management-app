import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function add(a: number, b: number): number {
  return new Decimal(a).plus(new Decimal(b)).toNumber();
}

export function subtract(a: number, b: number): number {
  return new Decimal(a).minus(new Decimal(b)).toNumber();
}

export function multiply(a: number, b: number): number {
  return new Decimal(a).times(new Decimal(b)).toNumber();
}

export function divide(a: number, b: number): number {
  if (b === 0) return 0;
  return new Decimal(a).dividedBy(new Decimal(b)).toNumber();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}
