import { DateTime, Interval } from 'luxon'

export function checkTimeSlotAvailability(
  start: DateTime,
  end: DateTime,
  availableRanges: { startHour: string; endHour: string }[],
): boolean {
  const requestDate = start.startOf('day')

  for (const range of availableRanges) {
    const [startHour, startMinute] = range.startHour.split(':').map(Number)
    const [endHour, endMinute] = range.endHour.split(':').map(Number)

    const rangeStart = requestDate.set({
      hour: startHour,
      minute: startMinute,
    })
    const rangeEnd = requestDate.set({ hour: endHour, minute: endMinute })
    const rangeInterval = Interval.fromDateTimes(rangeStart, rangeEnd)

    if (rangeInterval.contains(start)) {
      if (end <= rangeEnd) {
        return true
      }
    }
  }

  return false
}
