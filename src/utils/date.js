/**
 * Pure date calculation and formatting utilities.
 * Designed to prevent React render-purity warnings by keeping calculations pure.
 */

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function getTodayDateString(referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0')
  const day = String(referenceDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses YYYY-MM-DD into a localized midnight Date object.
 */
export function parseISODate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  const parts = dateStr.slice(0, 10).split('-')
  if (parts.length !== 3) return null
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const day = parseInt(parts[2], 10)
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null
  return new Date(year, month, day)
}

/**
 * Formats YYYY-MM-DD or ISO string into human-friendly format (e.g. "Oct 24, 2026").
 */
export function formatDisplayDate(dateStr) {
  const date = parseISODate(dateStr)
  if (!date) return dateStr || '—'
  const month = MONTH_NAMES[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

/**
 * Returns difference in calendar days between targetDate and referenceDate (target - ref).
 */
export function getDayDifference(targetDateStr, referenceDate = new Date()) {
  const target = parseISODate(targetDateStr)
  if (!target) return null
  const ref = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  )
  const diffMs = target.getTime() - ref.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Checks if target date is before today.
 */
export function isOverdue(dateStr, referenceDate = new Date()) {
  const diff = getDayDifference(dateStr, referenceDate)
  return diff !== null && diff < 0
}

/**
 * Checks if target date is today.
 */
export function isToday(dateStr, referenceDate = new Date()) {
  const diff = getDayDifference(dateStr, referenceDate)
  return diff === 0
}

/**
 * Checks if target date falls within the upcoming N days (including today).
 */
export function isUpcoming(dateStr, daysAhead = 7, referenceDate = new Date()) {
  const diff = getDayDifference(dateStr, referenceDate)
  return diff !== null && diff >= 0 && diff <= daysAhead
}

/**
 * Checks if a date falls within the current calendar week (Sunday to Saturday or Monday to Sunday).
 */
export function isWithinCurrentWeek(dateStr, referenceDate = new Date()) {
  const target = parseISODate(dateStr)
  if (!target) return false

  const startOfWeek = new Date(referenceDate)
  const day = startOfWeek.getDay() // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day // adjust when day is sunday
  startOfWeek.setDate(startOfWeek.getDate() + diffToMonday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  return target >= startOfWeek && target <= endOfWeek
}

/**
 * Friendly relative label for due dates (e.g. "Overdue by 2d", "Today", "Tomorrow", "In 4d").
 */
export function getDueStatusLabel(dateStr, referenceDate = new Date()) {
  const diff = getDayDifference(dateStr, referenceDate)
  if (diff === null) return null
  if (diff < -1) return `Overdue by ${Math.abs(diff)}d`
  if (diff === -1) return 'Overdue yesterday'
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  return `In ${diff} days`
}
