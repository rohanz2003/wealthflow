export const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'SGD', 'JPY'];

export const CURRENCY_INFO = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'en-AE' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
};

const RATES_TO_USD = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.34,
  JPY: 150,
};

export function isValidCurrency(code) {
  return CURRENCIES.includes(code);
}

export function convert(amount, from, to) {
  const value = Number(amount) || 0;
  const source = isValidCurrency(from) ? from : 'INR';
  const target = isValidCurrency(to) ? to : 'INR';
  if (!RATES_TO_USD[source] || !RATES_TO_USD[target]) return value;
  return value * (RATES_TO_USD[target] / RATES_TO_USD[source]);
}

export function formatCurrencyWith(amount, currency) {
  const info = CURRENCY_INFO[isValidCurrency(currency) ? currency : 'INR'];
  return `${info.symbol}${(amount ?? 0).toLocaleString(info.locale)}`;
}

export function currencyOptions() {
  return CURRENCIES.map((code) => ({ value: code, label: `${CURRENCY_INFO[code].symbol} ${code} — ${CURRENCY_INFO[code].name}` }));
}
