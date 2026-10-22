import { describe, it, expect } from 'vitest'
import {
  normalizeApplication,
  generateCSV,
  parseImportJSON,
} from '../storage.js'

describe('storage.js utilities', () => {
  it('normalizes legacy applications preserving backward compatibility', () => {
    const legacyApp = {
      id: 'legacy-1',
      company: 'TCS',
      role: 'System Engineer',
      date: '2026-05-10',
      status: 'Interview',
    }

    const normalized = normalizeApplication(legacyApp)

    expect(normalized).toBeDefined()
    expect(normalized.id).toBe('legacy-1')
    expect(normalized.company).toBe('TCS')
    expect(normalized.role).toBe('System Engineer')
    expect(normalized.date).toBe('2026-05-10')
    expect(normalized.status).toBe('Interview')
    // Safe defaults for newly added fields
    expect(normalized.location).toBe('')
    expect(normalized.employmentType).toBe('Full-time')
    expect(normalized.salary).toBe('')
    expect(normalized.nextFollowUpDone).toBe(false)
  })

  it('safely falls back to Applied status for unknown statuses', () => {
    const invalidApp = {
      company: 'Acme',
      role: 'Dev',
      status: 'UnknownStatus',
    }

    const normalized = normalizeApplication(invalidApp)
    expect(normalized.status).toBe('Applied')
  })

  it('generates valid RFC-4180 CSV with escaped quotes and commas', () => {
    const apps = [
      {
        company: 'Foo, Inc.',
        role: 'Engineer "Senior"',
        status: 'Offer',
        date: '2026-10-01',
        location: 'Remote',
        employmentType: 'Full-time',
        source: 'LinkedIn',
        salary: '$100k',
        nextFollowUp: '2026-10-15',
        nextFollowUpNote: 'Call HR',
        nextFollowUpDone: true,
        interviewDate: '2026-10-10',
        jobUrl: 'https://example.com',
        notes: 'Line 1\nLine 2',
      },
    ]

    const csv = generateCSV(apps)
    expect(csv).toContain('"Company","Role"')
    expect(csv).toContain('"Foo, Inc."')
    expect(csv).toContain('"Engineer ""Senior"""')
    expect(csv).toContain('"Yes"')
  })

  it('validates imported JSON arrays and object envelopes', () => {
    const rawArray = JSON.stringify([
      { company: 'Google', role: 'SWE', status: 'Applied', date: '2026-10-10' },
    ])
    const res1 = parseImportJSON(rawArray)
    expect(res1.valid).toBe(true)
    expect(res1.applications.length).toBe(1)
    expect(res1.applications[0].company).toBe('Google')

    const rawEnvelope = JSON.stringify({
      version: 1,
      exportedAt: '2026-10-22',
      data: [
        { company: 'Microsoft', role: 'Product Manager', status: 'Wishlist' },
      ],
    })
    const res2 = parseImportJSON(rawEnvelope)
    expect(res2.valid).toBe(true)
    expect(res2.applications.length).toBe(1)
    expect(res2.applications[0].company).toBe('Microsoft')
  })

  it('gracefully rejects corrupted or malformed JSON imports', () => {
    const invalidJSON = 'not a json string'
    const res1 = parseImportJSON(invalidJSON)
    expect(res1.valid).toBe(false)
    expect(res1.error).toBeDefined()

    const emptyArray = '[]'
    const res2 = parseImportJSON(emptyArray)
    expect(res2.valid).toBe(false)
  })
})
