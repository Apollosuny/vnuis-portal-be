export interface TimeRange {
  startTime: string
  endTime: string
}

export function consolidateTimeRanges(records: TimeRange[]): TimeRange[] {
  // Sort records by start time
  const sortedRecords = records.sort((a, b) => a.startTime.localeCompare(b.startTime))

  const consolidated: TimeRange[] = []
  let currentRange: TimeRange | null = null

  for (const record of sortedRecords) {
    if (currentRange === null) {
      currentRange = { ...record }
    } else if (record.startTime <= currentRange.endTime) {
      currentRange.endTime = currentRange.endTime > record.endTime ? currentRange.endTime : record.endTime
    } else {
      consolidated.push(currentRange)
      currentRange = { ...record }
    }
  }

  if (currentRange !== null) {
    consolidated.push(currentRange)
  }

  return consolidated
}
