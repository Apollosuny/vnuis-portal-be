export interface BookingTime {
  startTime: string
  endTime: string
  dows: string[]
}

export function groupBookingTimesByDow(bookingTimes: BookingTime[]): Record<string, BookingTime[]> {
  const groupedBookings: Record<string, BookingTime[]> = {}

  for (const booking of bookingTimes) {
    for (const dow of booking.dows) {
      if (!groupedBookings[dow]) {
        groupedBookings[dow] = []
      }
      groupedBookings[dow]?.push(booking)
    }
  }

  return groupedBookings
}
