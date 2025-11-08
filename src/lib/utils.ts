import crypto from 'crypto';

export function generateOrderId(): string {
  return 'ORD' + Date.now();
}

export function generateTxnRefNo(): string {
  return 'T' + new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
}

// JazzCash hash (from docs)
export function generateSecureHash(params: Record<string, any>, hashKey: string): string {
  const sortedKeys = Object.keys(params).sort();
  let hashString = '';
  sortedKeys.forEach((key) => {
    hashString += params[key] + '&';
  });
  hashString = hashString.slice(0, -1); // Remove last &
  return crypto.createHmac('sha256', hashKey).update(hashString).digest('hex').toUpperCase();
}