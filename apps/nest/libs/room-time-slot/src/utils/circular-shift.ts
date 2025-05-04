export function circularShiftLeft(bits: number, shiftAmount: number): number {
  // Masking 7 bits only (to simulate a 7-bit number)
  bits = bits & 0b1111111

  // Perform the shift and wrap-around using OR
  return ((bits << shiftAmount) | (bits >> (7 - shiftAmount))) & 0b1111111
}

export function circularShiftRight(bits: number, shiftAmount: number): number {
  // Masking 7 bits only (to simulate a 7-bit number)
  bits = bits & 0b1111111

  // Perform the shift and wrap-around using OR
  return ((bits >> shiftAmount) | (bits << (7 - shiftAmount))) & 0b1111111
}
