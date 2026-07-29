export function formatCurrency(amount) {
  return `₹${(amount ?? 0).toLocaleString('en-IN')}`;
}
