import { DateTime } from 'luxon'

export const buildDateTimePrimitiveFromIsoOffset = ({ isoString, offset }: { isoString: string; offset: number }) => {
  const base = DateTime.fromISO(isoString)
  return buildDateTimePrimitiveFromOffset({ base, offset })
}

export const buildDateTimePrimitiveFromOffset = ({ base, offset }: { base: DateTime; offset: number }) => {
  const offsetHours = offset / 60
  const offsetString = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`
  const zoneName = `UTC${offsetString}`

  return base.setZone(zoneName)
}
