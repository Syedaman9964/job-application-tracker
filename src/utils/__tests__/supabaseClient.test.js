import { describe, it, expect } from 'vitest'
import {
  isAdminUser,
  mapRowToApplication,
  mapApplicationToRow,
  TARGET_ADMIN_EMAIL,
} from '../supabaseClient.js'

describe('supabaseClient security & mapping utilities', () => {
  it('correctly validates the designated administrator email', () => {
    expect(isAdminUser({ email: TARGET_ADMIN_EMAIL })).toBe(true)
    expect(isAdminUser({ email: 'SYEDAMAN996455@GMAIL.COM' })).toBe(true)
    expect(isAdminUser({ email: 'syedaman996455@gmail.com ' })).toBe(true)
    expect(isAdminUser({ email: 'attacker@evil.com' })).toBe(false)
    expect(isAdminUser({ email: 'user@example.com' })).toBe(false)
    expect(isAdminUser(null)).toBe(false)
    expect(isAdminUser({})).toBe(false)
  })

  it('accurately maps database rows (snake_case) to client applications (camelCase)', () => {
    const dbRow = {
      id: 'db-1234',
      company: 'Amazon Web Services',
      role: 'Cloud Architect',
      status: 'Interview',
      date: '2026-10-22',
      location: 'Hyderabad, India',
      employment_type: 'Full-time',
      source: 'Referral',
      salary: '₹35 - 45 LPA',
      job_url: 'https://aws.amazon.com/careers',
      job_description: 'Design cloud native systems.',
      notes: 'Prepare leadership principles.',
      next_follow_up: '2026-10-25',
      next_follow_up_note: 'Review system design architectures',
      next_follow_up_done: false,
      interview_date: '2026-10-26T10:00:00Z',
      interview_notes: 'System Design Round with Principal Engineer',
      created_at: '2026-10-22T08:00:00Z',
      updated_at: '2026-10-22T08:00:00Z',
    }

    const app = mapRowToApplication(dbRow)

    expect(app.id).toBe('db-1234')
    expect(app.company).toBe('Amazon Web Services')
    expect(app.employmentType).toBe('Full-time')
    expect(app.jobUrl).toBe('https://aws.amazon.com/careers')
    expect(app.nextFollowUp).toBe('2026-10-25')
    expect(app.nextFollowUpDone).toBe(false)
    expect(app.interviewDate).toBe('2026-10-26T10:00:00Z')
  })

  it('accurately maps client applications (camelCase) to database rows (snake_case)', () => {
    const app = {
      company: 'Google',
      role: 'Software Engineer III',
      status: 'Applied',
      date: '2026-10-20',
      location: 'Bengaluru',
      employmentType: 'Full-time',
      source: 'LinkedIn',
      salary: 'Competitive',
      jobUrl: 'https://careers.google.com',
      jobDescription: 'Distributed systems.',
      notes: 'Referral submitted.',
      nextFollowUp: '2026-10-27',
      nextFollowUpNote: 'Check referral portal',
      nextFollowUpDone: false,
      interviewDate: '',
      interviewNotes: '',
    }

    const row = mapApplicationToRow(app, 'auth-user-uuid-99')

    expect(row.company).toBe('Google')
    expect(row.role).toBe('Software Engineer III')
    expect(row.user_id).toBe('auth-user-uuid-99')
    expect(row.employment_type).toBe('Full-time')
    expect(row.job_url).toBe('https://careers.google.com')
    expect(row.next_follow_up).toBe('2026-10-27')
    expect(row.next_follow_up_done).toBe(false)
  })
})
