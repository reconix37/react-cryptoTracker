export const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: absValue < 1 ? 4 : 2,
    maximumFractionDigits: absValue < 1 ? 6 : 2,
  }).format(value);
};