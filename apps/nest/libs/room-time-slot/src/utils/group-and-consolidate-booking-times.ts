import { consolidateTimeRanges, TimeRange } from './consolidate-time-range'
import { BookingTime, groupBookingTimesByDow } from './group-time-by-dow'

export const groupAndConsolidateBookingTimes = (bookingTimes: BookingTime[]) => {
  const map: Record<string, TimeRange[]> = groupBookingTimesByDow(bookingTimes)
  // Loop through all key-value pairs of map
  for (const [dow, timeRanges] of Object.entries(map)) {
    // Consolidate time ranges for each day of week
    map[dow] = consolidateTimeRanges(timeRanges).map((r) => ({
      startTime: r.startTime,
      endTime: r.endTime,
    }))
  }

  return map
}
