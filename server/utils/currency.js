const { CURRENCIES } = require('../../shared/constants');

const RATES_TO_USD = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.34,
  JPY: 150,
};

const DEFAULT_CURRENCY = 'INR';

function isValidCurrency(code) {
  return CURRENCIES.includes(code);
}

function convert(amount, from, to) {
  const value = Number(amount) || 0;
  const source = isValidCurrency(from) ? from : DEFAULT_CURRENCY;
  const target = isValidCurrency(to) ? to : DEFAULT_CURRENCY;
  if (!RATES_TO_USD[source] || !RATES_TO_USD[target]) return value;
  return value * (RATES_TO_USD[target] / RATES_TO_USD[source]);
}

function toBase(amount, from, base) {
  return convert(amount, from, base);
}

module.exports = { convert, toBase, isValidCurrency, RATES_TO_USD, DEFAULT_CURRENCY };
