interface TaxCalculationInput {
  amount: number;
  currency?: string;
}

interface TaxCalculationResult {
  taxAmount: number;
  taxRate: number;
  taxableAmount: number;
  currency: string;
}

export async function calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult> {
  return {
    taxAmount: 0,
    taxRate: 0,
    taxableAmount: input.amount,
    currency: input.currency ?? "usd",
  };
}
