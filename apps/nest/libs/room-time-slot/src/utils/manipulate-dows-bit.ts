import { circularShiftLeft, circularShiftRight } from './circular-shift'

export const pushDowsBitForward = (bit: number) => circularShiftLeft(bit, 1)
export const pushDowsBitBackward = (bit: number) => circularShiftRight(bit, 1)
