export type CurrencyInput = number | string | null | undefined;

export interface MechanicCommissionInput {
  labor: CurrencyInput;
  parts: CurrencyInput;
  laborPercentage: number | string | null | undefined;
  partsPercentage: number | string | null | undefined;
}

export const parseCurrencyInput = (value: CurrencyInput) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  const rawValue = `${value ?? ''}`.trim();
  if (!rawValue || rawValue.startsWith('-')) return 0;

  const digitsOnly = rawValue.replace(/[^\d]/g, '');
  const parsedValue = Number(digitsOnly);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

const normalizePercentage = (value: number | string | null | undefined) => {
  const parsedValue = Number(`${value ?? ''}`.replace(',', '.'));
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
};

export const calculatePartsCommission = (
  amount: CurrencyInput,
  percentage: number | string | null | undefined
) => {
  return Math.round(parseCurrencyInput(amount) * (normalizePercentage(percentage) / 100));
};

export const calculateMechanicCommission = ({
  labor,
  parts,
  laborPercentage,
  partsPercentage,
}: MechanicCommissionInput) => {
  return (
    calculatePartsCommission(labor, laborPercentage) +
    calculatePartsCommission(parts, partsPercentage)
  );
};
