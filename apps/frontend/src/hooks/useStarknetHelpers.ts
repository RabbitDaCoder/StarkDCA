/**
 * Starknet formatting utilities.
 */
import { shortString } from 'starknet';
import { TOKEN_DECIMALS } from '@/constants';

/**
 * Format a u256 wei value to a human-readable token amount.
 * e.g. 1_000_000_000_000_000_000n → "1.00"
 */
export function formatTokenAmount(
  wei: bigint | undefined,
  decimals: number = TOKEN_DECIMALS,
  displayDecimals: number = 4,
): string {
  if (wei === undefined || wei === null) return '0';
  const divisor = BigInt(10 ** decimals);
  const whole = wei / divisor;
  const remainder = wei % divisor;
  const fractional = remainder.toString().padStart(decimals, '0').slice(0, displayDecimals);
  return `${whole}.${fractional}`;
}

/**
 * Parse a human token amount string to u256 wei bigint.
 * e.g. "100.5" → 100_500_000_000_000_000_000n
 */
export function parseTokenAmount(amount: string, decimals: number = TOKEN_DECIMALS): bigint {
  const parts = amount.split('.');
  const whole = parts[0] || '0';
  const frac = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + frac);
}

/**
 * Decode a felt252 to a short string.
 */
export function felt252ToString(felt: string | bigint): string {
  try {
    return shortString.decodeShortString(felt.toString());
  } catch {
    return felt.toString();
  }
}

/**
 * Truncate a Starknet address for display.
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Plan status number → human label.
 */
export function planStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return 'Active';
    case 1:
      return 'Cancelled';
    case 2:
      return 'Completed';
    default:
      return 'Unknown';
  }
}
