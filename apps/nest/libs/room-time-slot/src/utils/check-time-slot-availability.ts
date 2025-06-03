import { DateTime, Interval } from 'luxon'

export function checkTimeSlotAvailability(
  start: DateTime,
  end: DateTime,
  availableRanges: { startHour: string; endHour: string }[],
): boolean {
  const requestDate = start.startOf('day')

  for (const range of availableRanges) {
    try {
      const [startHour, startMinute] = range.startHour.split(':').map(Number)
      const [endHour, endMinute] = range.endHour.split(':').map(Number)

      const rangeStart = requestDate
        .set({
          hour: startHour || 0,
          minute: startMinute || 0,
        })
        .startOf('minute')

      const rangeEnd = requestDate
        .set({
          hour: endHour || 23,
          minute: endMinute || 59,
        })
        .startOf('minute')

      // Safety check - ensure we have valid dates
      if (!rangeStart.isValid || !rangeEnd.isValid || !start.isValid || !end.isValid) {
        console.error('Invalid datetime in range check:', { rangeStart, rangeEnd, start, end })
        continue
      }

      // Make sure times are all in the same zone for comparison
      const normalizedStart = start.setZone(requestDate.zone)
      const normalizedEnd = end.setZone(requestDate.zone)

      const requestInterval = Interval.fromDateTimes(normalizedStart.startOf('minute'), normalizedEnd.startOf('minute'))
      const rangeInterval = Interval.fromDateTimes(rangeStart, rangeEnd)

      const isContained = rangeInterval.contains(normalizedStart) && rangeInterval.contains(normalizedEnd)
      if (isContained) {
        console.log('Found matching time slot:', { range, start: normalizedStart.toISO(), end: normalizedEnd.toISO() })
        return true
      }
    } catch (err) {
      console.error('Error checking time slot:', err)
      continue
    }
  }

  return false
}
