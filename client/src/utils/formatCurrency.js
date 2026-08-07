import { formatCurrencyWith } from './currency';

let baseCurrency = 'INR';

export function setBaseCurrency(currency) {
  if (currency) baseCurrency = currency;
}

export function getBaseCurrency() {
  return baseCurrency;
}

export function formatCurrency(amount, currency) {
  return formatCurrencyWith(amount, currency || baseCurrency);
}
