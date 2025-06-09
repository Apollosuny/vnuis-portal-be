import * as crypto from 'crypto'

/**
 * Create SHA-256 hash from form data
 */
export function createFormHash(formData: any): Uint8Array {
  // Sort object keys for consistent hashing
  const sortedData = sortObjectDeep(formData)
  const dataString = JSON.stringify(sortedData)
  const hash = crypto.createHash('sha256').update(dataString).digest()
  return new Uint8Array(hash)
}

/**
 * Convert number array to hex string
 */
export function arrayToHash(arr?: number[]): string {
  if (!arr) return ''
  return Buffer.from(arr).toString('hex')
}

/**
 * Convert hex string to Uint8Array
 */
export function hashToArray(hash: string): Uint8Array {
  return new Uint8Array(Buffer.from(hash, 'hex'))
}

/**
 * Sort object keys to ensure consistent hashing
 */
export function sortObjectDeep(obj: any): any {
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sortObjectDeep(item))
  }

  // Only process objects
  if (typeof obj !== 'object') {
    return obj
  }

  const sortedObj: Record<string, any> = {}
  const keys = Object.keys(obj).sort()

  // Process each key recursively
  for (const key of keys) {
    sortedObj[key] = sortObjectDeep(obj[key])
  }

  return sortedObj
}

/**
 * Compare two Uint8Array instances for equality
 */
export function compareUint8Arrays(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}

/**
 * Helper class for blockchain related utilities
 */
export const bh = {
  createFormHash,
  arrayToHash,
  hashToArray,
  sortObjectDeep,
  compareUint8Arrays,
}
