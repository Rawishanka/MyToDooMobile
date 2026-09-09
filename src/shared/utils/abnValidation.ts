const ABN_WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

export function normalizeAbn(input: string): string {
  return input.replace(/\D/g, '');
}

export function formatAbnInput(value: string): string {
  const digits = normalizeAbn(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
}

export function isValidAbnChecksum(abn: string): boolean {
  const digits = normalizeAbn(abn);
  if (digits.length !== 11) return false;
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    let digit = parseInt(digits[i], 10);
    if (i === 0) digit -= 1;
    sum += digit * ABN_WEIGHTS[i];
  }
  return sum % 89 === 0;
}

export function validateAbn(input: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = normalizeAbn(input);
  if (!normalized) return { valid: false, normalized, error: 'ABN is required' };
  if (normalized.length !== 11) return { valid: false, normalized, error: 'ABN must be exactly 11 digits' };
  if (!isValidAbnChecksum(normalized)) return { valid: false, normalized, error: 'ABN checksum is invalid' };
  return { valid: true, normalized };
}
