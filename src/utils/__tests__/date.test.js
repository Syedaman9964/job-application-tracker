import { describe, it, expect } from 'vitest'
import {
  parseISODate,
  formatDisplayDate,
  getDayDifference,
  isOverdue,
  isToday,
  isUpcoming,
  getDueStatusLabel,
} from '../date.js'

describe('date.js utilities', () => {
  const refDate = new Date(2026, 9, 22) // Oct 22, 2026

  it('correctly parses ISO date strings without timezone drift', () => {
    const d = parseISODate('2026-10-22')
    expect(d).not.toBeNull()
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(9) // 0-indexed October
    expect(d.getDate()).toBe(22)
  })

  it('formats display dates into readable string', () => {
    expect(formatDisplayDate('2026-10-22')).toBe('Oct 22, 2026')
    expect(formatDisplayDate('2026-01-05')).toBe('Jan 5, 2026')
    expect(formatDisplayDate('')).toBe('—')
  })

  it('calculates day differences accurately', () => {
    expect(getDayDifference('2026-10-22', refDate)).toBe(0)
    expect(getDayDifference('2026-10-24', refDate)).toBe(2)
    expect(getDayDifference('2026-10-20', refDate)).toBe(-2)
  })

  it('identifies overdue and upcoming dates', () => {
    expect(isToday('2026-10-22', refDate)).toBe(true)
    expect(isOverdue('2026-10-21', refDate)).toBe(true)
    expect(isOverdue('2026-10-23', refDate)).toBe(false)
    expect(isUpcoming('2026-10-25', 7, refDate)).toBe(true)
    expect(isUpcoming('2026-11-15', 7, refDate)).toBe(false)
  })

  it('generates clear human-readable status labels', () => {
    expect(getDueStatusLabel('2026-10-22', refDate)).toBe('Due today')
    expect(getDueStatusLabel('2026-10-23', refDate)).toBe('Due tomorrow')
    expect(getDueStatusLabel('2026-10-25', refDate)).toBe('In 3 days')
    expect(getDueStatusLabel('2026-10-21', refDate)).toBe('Overdue yesterday')
    expect(getDueStatusLabel('2026-10-19', refDate)).toBe('Overdue by 3d')
  })
})
