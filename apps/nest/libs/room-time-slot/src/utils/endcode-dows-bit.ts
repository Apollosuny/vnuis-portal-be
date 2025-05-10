import { dowBitValues } from './dow-bit-values'

export const encodeDowsBit = (dows: string[]) => {
  return dows.reduce((acc, d) => {
    return acc + (dowBitValues[d] || 0)
  }, 0)
}
