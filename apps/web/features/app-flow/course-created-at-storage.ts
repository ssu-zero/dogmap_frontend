const STORAGE_KEY = "dogmap.course-created-at.v1"

type CourseDateStorage = Pick<Storage, "getItem" | "setItem">

export function getBrowserCourseDateStorage(): CourseDateStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function formatCourseCreatedAt(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", ".")
}

export function readCourseCreatedDates(
  storage?: Pick<CourseDateStorage, "getItem">
): Record<string, string> {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([courseId, date]) =>
          courseId.length > 0 &&
          typeof date === "string" &&
          /^\d{4}\.\d{2}\.\d{2}$/.test(date)
      )
    )
  } catch {
    return {}
  }
}

export function saveCourseCreatedDate(
  storage: CourseDateStorage | undefined,
  courseId: string,
  date: string
): Record<string, string> {
  const dates = { ...readCourseCreatedDates(storage), [courseId]: date }

  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(dates))
  } catch {
    // The current course can still display its date when storage is unavailable.
  }

  return dates
}
