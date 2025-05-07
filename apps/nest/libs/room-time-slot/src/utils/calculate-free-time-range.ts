export interface Range {
  startHour: string
  endHour: string
}

export function calculateFreeTimeRanges({
  possibleTimeRanges,
  overlapped,
}: {
  possibleTimeRanges: Range[]
  overlapped: Range[]
}): Range[] {
  const freeTimeRanges: Range[] = []

  overlapped.sort((a, b) => a.startHour.localeCompare(b.startHour))

  for (const possible of possibleTimeRanges) {
    let start = possible.startHour
    const end = possible.endHour

    for (const overlap of overlapped) {
      if (overlap.endHour <= start) {
        continue
      }
      if (overlap.startHour >= end) {
        break
      }

      if (start < overlap.startHour) {
        freeTimeRanges.push({ startHour: start, endHour: overlap.startHour })
      }
      start = overlap.endHour > start ? overlap.endHour : start
    }

    if (start < end) {
      freeTimeRanges.push({ startHour: start, endHour: end })
    }
  }

  return freeTimeRanges
}
