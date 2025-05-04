import { dowBitValues } from './dow-bit-values'

export const encodeDowsBit = (dows: string[]) => {
  return dows.reduce((acc, d) => acc + (dowBitValues[d] || 0), 0)
}
