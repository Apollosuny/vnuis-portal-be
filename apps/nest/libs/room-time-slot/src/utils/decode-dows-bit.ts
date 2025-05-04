import { dowBitPositions } from './dow-bit-positions'

export const decodeDowsBit = (weekdayNumber: number): string[] => {
  const binaryString = weekdayNumber.toString(2).padStart(7, '0')
  const activeDays: string[] = []

  Object.entries(dowBitPositions).forEach(([day, pos]) => {
    if (binaryString[6 - pos] === '1') {
      activeDays.push(day)
    }
  })

  return activeDays
}
