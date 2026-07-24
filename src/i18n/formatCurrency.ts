export type CurrencyFormatter = (value: number) => string;

export function createEuroFormatter(locale: string): CurrencyFormatter {
  const numberFormat = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return (value) => numberFormat.format(value);
}
