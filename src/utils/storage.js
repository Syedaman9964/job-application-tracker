/**
 * Storage and Data Portability Utilities for JobTrack
 * Preserves 100% backward compatibility with existing localStorage keys.
 */

export const STORAGE_KEY = 'jobtrack-applications'
export const SETTINGS_KEY = 'jobtrack-settings'

export const STATUSES = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']
export const EMPLOYMENT_TYPES = ['Full-time', 'Internship', 'Contract', 'Part-time']
export const SOURCES = [
  'LinkedIn',
  'Company Website',
  'Indeed',
  'Referral',
  'Job Fair',
  'GitHub Jobs',
  'Other',
]

export const DEFAULT_SETTINGS = {
  defaultView: 'dashboard', // 'dashboard' | 'kanban' | 'applications' | 'followups'
  weeklyGoal: 5,
}

/**
 * Normalizes an application record, ensuring backward compatibility with legacy entries.
 * Does not mutate the original object.
 */
export function normalizeApplication(raw) {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const id = raw.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))
  const company = String(raw.company || '').trim() || 'Untitled Company'
  const role = String(raw.role || '').trim() || 'Software Engineer'
  const date = String(raw.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
  
  // Backward compatibility: default to 'Applied' if status is missing or unfamiliar
  const validStatus = STATUSES.includes(raw.status) ? raw.status : 'Applied'

  return {
    id,
    company,
    role,
    date,
    status: validStatus,
    location: String(raw.location || '').trim(),
    employmentType: EMPLOYMENT_TYPES.includes(raw.employmentType) ? raw.employmentType : 'Full-time',
    source: String(raw.source || '').trim() || 'Other',
    salary: String(raw.salary || '').trim(),
    jobUrl: String(raw.jobUrl || '').trim(),
    jobDescription: String(raw.jobDescription || '').trim(),
    notes: String(raw.notes || '').trim(),
    nextFollowUp: String(raw.nextFollowUp || '').slice(0, 10),
    nextFollowUpNote: String(raw.nextFollowUpNote || '').trim(),
    nextFollowUpDone: Boolean(raw.nextFollowUpDone),
    interviewDate: String(raw.interviewDate || '').slice(0, 16),
    interviewNotes: String(raw.interviewNotes || '').trim(),
    createdAt: raw.createdAt || raw.date || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  }
}

/**
 * Loads and normalizes all applications from localStorage safely.
 */
export function loadApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeApplication).filter(Boolean)
  } catch (err) {
    console.error('Failed to load applications from localStorage:', err)
    return []
  }
}

/**
 * Persists applications to localStorage.
 */
export function saveApplications(applications) {
  try {
    const cleanList = Array.isArray(applications)
      ? applications.map(normalizeApplication).filter(Boolean)
      : []
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList))
    return true
  } catch (err) {
    console.error('Failed to save applications to localStorage:', err)
    return false
  }
}

/**
 * Loads user settings.
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/**
 * Persists user settings.
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }))
    return true
  } catch {
    return false
  }
}

/**
 * Generates an RFC-4180 compliant CSV string for export.
 */
export function generateCSV(applications) {
  const headers = [
    'Company',
    'Role',
    'Status',
    'Applied Date',
    'Location',
    'Employment Type',
    'Source',
    'Salary',
    'Next Follow-up',
    'Follow-up Note',
    'Follow-up Done',
    'Interview Date',
    'Job URL',
    'Notes',
  ]

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const headerLine = headers.map(escapeCell).join(',')
  const rows = applications.map((app) => [
    escapeCell(app.company),
    escapeCell(app.role),
    escapeCell(app.status),
    escapeCell(app.date),
    escapeCell(app.location),
    escapeCell(app.employmentType),
    escapeCell(app.source),
    escapeCell(app.salary),
    escapeCell(app.nextFollowUp),
    escapeCell(app.nextFollowUpNote),
    escapeCell(app.nextFollowUpDone ? 'Yes' : 'No'),
    escapeCell(app.interviewDate),
    escapeCell(app.jobUrl),
    escapeCell(app.notes),
  ].join(','))

  return [headerLine, ...rows].join('\r\n')
}

/**
 * Triggers a browser download of a file.
 */
export function downloadFile(content, fileName, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validates and extracts application records from imported JSON string.
 */
export function parseImportJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    let candidateList = []

    if (Array.isArray(parsed)) {
      candidateList = parsed
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.data)) {
      candidateList = parsed.data
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.applications)) {
      candidateList = parsed.applications
    } else {
      return {
        valid: false,
        error: 'Invalid format: JSON must contain an array of application records or a data envelope.',
        applications: [],
      }
    }

    const validApplications = candidateList
      .filter((item) => item && typeof item === 'object' && (item.company || item.role))
      .map(normalizeApplication)

    if (validApplications.length === 0) {
      return {
        valid: false,
        error: 'No valid application records found in the imported file.',
        applications: [],
      }
    }

    return {
      valid: true,
      applications: validApplications,
      count: validApplications.length,
    }
  } catch (err) {
    return {
      valid: false,
      error: `JSON parse error: ${err.message}`,
      applications: [],
    }
  }
}

/**
 * Estimates storage usage in Kilobytes.
 */
export function getStorageUsage() {
  try {
    let totalChars = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        totalChars += key.length + (localStorage.getItem(key)?.length || 0)
      }
    }
    // UTF-16 characters typically use 2 bytes in browser storage
    const kbUsed = (totalChars * 2) / 1024
    return {
      kbUsed: Math.max(0.1, Number(kbUsed.toFixed(1))),
      limitKb: 5120, // Typical 5MB standard limit
    }
  } catch {
    return { kbUsed: 0, limitKb: 5120 }
  }
}

/**
 * Curated realistic sample applications to showcase the platform.
 */
export function getSampleApplications() {
  const today = new Date().toISOString().slice(0, 10)
  
  // Safe relative dates
  const d = (daysOffset) => {
    const target = new Date()
    target.setDate(target.getDate() + daysOffset)
    return target.toISOString().slice(0, 10)
  }

  return [
    {
      id: 'demo-app-1',
      company: 'Stripe',
      role: 'Frontend Engineer (Design Systems)',
      date: d(-14),
      status: 'Interview',
      location: 'Remote (US/EU)',
      employmentType: 'Full-time',
      source: 'LinkedIn',
      salary: '$140k - $165k',
      jobUrl: 'https://stripe.com/jobs',
      jobDescription: 'Build polished web components, accessible UI libraries, and internal tooling with React and TypeScript.',
      notes: 'Completed technical screen. System architecture round scheduled with team lead.',
      nextFollowUp: d(2),
      nextFollowUpNote: 'Review React 19 concurrent features and CSS architecture questions',
      nextFollowUpDone: false,
      interviewDate: `${d(2)}T15:00`,
      interviewNotes: 'Prepare portfolio walkthrough focusing on performance and keyboard accessibility.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-app-2',
      company: 'Linear',
      role: 'Product Engineer',
      date: d(-22),
      status: 'Offer',
      location: 'Hybrid - Bengaluru',
      employmentType: 'Full-time',
      source: 'Referral',
      salary: '₹22 - 28 LPA',
      jobUrl: 'https://linear.app/careers',
      jobDescription: 'Crafting high-speed productivity software with modern web stacks.',
      notes: 'Formal offer received! Benefits package and equity breakdown sent via email.',
      nextFollowUp: d(4),
      nextFollowUpNote: 'Schedule call with VP of Engineering to discuss team roadmap',
      nextFollowUpDone: false,
      interviewDate: '',
      interviewNotes: 'All 4 interview loops completed with strong positive feedback.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-app-3',
      company: 'Vercel',
      role: 'Junior Software Engineer',
      date: d(-7),
      status: 'Applied',
      location: 'Remote',
      employmentType: 'Full-time',
      source: 'Company Website',
      salary: '$95k - $115k',
      jobUrl: 'https://vercel.com/careers',
      jobDescription: 'Frontend framework engineering, developer experience, and documentation tools.',
      notes: 'Submitted application along with link to GitHub profile and demo projects.',
      nextFollowUp: d(5),
      nextFollowUpNote: 'Send brief follow-up note to hiring coordinator on LinkedIn',
      nextFollowUpDone: false,
      interviewDate: '',
      interviewNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-app-4',
      company: 'Datadog',
      role: 'Full Stack Engineer (Intern)',
      date: d(-18),
      status: 'Rejected',
      location: 'Bengaluru, India',
      employmentType: 'Internship',
      source: 'Indeed',
      salary: '₹60,000 / month',
      jobUrl: 'https://careers.datadoghq.com',
      jobDescription: 'Dashboard engineering and real-time visualization widgets.',
      notes: 'Received standard polite automated rejection after resume review.',
      nextFollowUp: '',
      nextFollowUpNote: '',
      nextFollowUpDone: false,
      interviewDate: '',
      interviewNotes: 'Reapply in 6 months after expanding backend telemetry projects.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-app-5',
      company: 'Raycast',
      role: 'Core Frontend Developer',
      date: today,
      status: 'Wishlist',
      location: 'Remote (Global)',
      employmentType: 'Full-time',
      source: 'GitHub Jobs',
      salary: '$110k - $130k',
      jobUrl: 'https://raycast.com',
      jobDescription: 'Building extension ecosystems and keyboard-first developer interfaces.',
      notes: 'Tailoring CV and writing a customized cover letter highlighting extension experience.',
      nextFollowUp: d(1),
      nextFollowUpNote: 'Finish customized CV and submit application before end of week',
      nextFollowUpDone: false,
      interviewDate: '',
      interviewNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}
