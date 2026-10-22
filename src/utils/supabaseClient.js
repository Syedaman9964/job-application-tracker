import { createClient } from '@supabase/supabase-js'

export const TARGET_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'syedaman996455@gmail.com'
).toLowerCase().trim()

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Checks whether Supabase environment variables are provided and valid (non-placeholder).
 */
export function isSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) return false
  const cleanUrl = String(supabaseUrl).trim().toLowerCase()
  const cleanKey = String(supabaseAnonKey).trim()

  const isPlaceholderUrl =
    cleanUrl.includes('your-project-id') ||
    cleanUrl.includes('your-project-ref') ||
    cleanUrl.includes('example.com') ||
    !cleanUrl.startsWith('https://')
  const isPlaceholderKey =
    cleanKey.includes('your-supabase-anon') ||
    cleanKey.includes('your-actual-anon') ||
    cleanKey.length < 20

  return !isPlaceholderUrl && !isPlaceholderKey
}

/**
 * Singleton Supabase client instance.
 * Initialized only if URL and Anon key are valid.
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Validates if the given user is the authorized administrator.
 */
export function isAdminUser(user) {
  if (!user || !user.email) return false
  return user.email.toLowerCase().trim() === TARGET_ADMIN_EMAIL
}

/**
 * Sign in with email and password.
 */
export async function signInAdmin(email, password) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please add your credentials to .env or Netlify settings.')
  }

  const cleanEmail = email.toLowerCase().trim()
  if (cleanEmail !== TARGET_ADMIN_EMAIL) {
    // Immediate early denial for unauthorized accounts
    throw new Error('Access denied: Unauthorized administrator account.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  })

  if (error) {
    throw error
  }

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut()
    throw new Error('Access denied: Unauthorized administrator account.')
  }

  return data
}

/**
 * Sign out administrator.
 */
export async function signOutAdmin() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/**
 * Request password reset email for admin.
 */
export async function requestPasswordReset(email) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const cleanEmail = email.toLowerCase().trim()
  if (cleanEmail !== TARGET_ADMIN_EMAIL) {
    throw new Error('Password reset is restricted to the administrator account.')
  }
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${window.location.origin}/#reset-password`,
  })
  if (error) throw error
  return true
}

/* ============================================================================
   Cloud Database Operations (Enforced by Row Level Security)
   ============================================================================ */

/**
 * Maps a database row (snake_case) to client application object (camelCase).
 */
export function mapRowToApplication(row) {
  if (!row) return null
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    date: row.date,
    location: row.location || '',
    employmentType: row.employment_type || 'Full-time',
    source: row.source || 'Other',
    salary: row.salary || '',
    jobUrl: row.job_url || '',
    jobDescription: row.job_description || '',
    notes: row.notes || '',
    nextFollowUp: row.next_follow_up || '',
    nextFollowUpNote: row.next_follow_up_note || '',
    nextFollowUpDone: Boolean(row.next_follow_up_done),
    interviewDate: row.interview_date || '',
    interviewNotes: row.interview_notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Maps client application object (camelCase) to database row (snake_case).
 */
export function mapApplicationToRow(app, userId) {
  const row = {
    company: app.company,
    role: app.role,
    status: app.status,
    date: app.date,
    location: app.location || '',
    employment_type: app.employmentType || 'Full-time',
    source: app.source || 'Other',
    salary: app.salary || '',
    job_url: app.jobUrl || '',
    job_description: app.jobDescription || '',
    notes: app.notes || '',
    next_follow_up: app.nextFollowUp || null,
    next_follow_up_note: app.nextFollowUpNote || '',
    next_follow_up_done: Boolean(app.nextFollowUpDone),
    interview_date: app.interviewDate ? new Date(app.interviewDate).toISOString() : null,
    interview_notes: app.interviewNotes || '',
  }

  if (userId) {
    row.user_id = userId
  }

  return row
}

/**
 * Fetches all applications for the authorized administrator.
 */
export async function fetchCloudApplications() {
  if (!supabase) return { data: [], error: 'Supabase is not configured' }

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []).map(mapRowToApplication), error: null }
}

/**
 * Inserts a new application into the cloud database.
 */
export async function insertCloudApplication(app, userId) {
  if (!supabase) throw new Error('Supabase is not configured')

  const row = mapApplicationToRow(app, userId)
  const { data, error } = await supabase
    .from('applications')
    .insert([row])
    .select()
    .single()

  if (error) throw error
  return mapRowToApplication(data)
}

/**
 * Maps partial updates (camelCase) to database row fields (snake_case).
 * Only sets defined properties so existing database columns are preserved.
 */
export function mapUpdatesToRow(updates) {
  if (!updates || typeof updates !== 'object') return {}
  const row = {}

  if (updates.company !== undefined) row.company = updates.company
  if (updates.role !== undefined) row.role = updates.role
  if (updates.status !== undefined) row.status = updates.status
  if (updates.date !== undefined) row.date = updates.date
  if (updates.location !== undefined) row.location = updates.location
  if (updates.employmentType !== undefined) row.employment_type = updates.employmentType
  if (updates.source !== undefined) row.source = updates.source
  if (updates.salary !== undefined) row.salary = updates.salary
  if (updates.jobUrl !== undefined) row.job_url = updates.jobUrl
  if (updates.jobDescription !== undefined) row.job_description = updates.jobDescription
  if (updates.notes !== undefined) row.notes = updates.notes
  if (updates.nextFollowUp !== undefined) row.next_follow_up = updates.nextFollowUp || null
  if (updates.nextFollowUpNote !== undefined) row.next_follow_up_note = updates.nextFollowUpNote
  if (updates.nextFollowUpDone !== undefined) row.next_follow_up_done = Boolean(updates.nextFollowUpDone)
  if (updates.interviewDate !== undefined) {
    row.interview_date = updates.interviewDate ? new Date(updates.interviewDate).toISOString() : null
  }
  if (updates.interviewNotes !== undefined) row.interview_notes = updates.interviewNotes

  return row
}

/**
 * Updates an existing application in the cloud database.
 */
export async function updateCloudApplication(id, updates) {
  if (!supabase) throw new Error('Supabase is not configured')

  const row = mapUpdatesToRow(updates)
  const { data, error } = await supabase
    .from('applications')
    .update(row)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapRowToApplication(data)
}

/**
 * Deletes an application from the cloud database.
 */
export async function deleteCloudApplication(id) {
  if (!supabase) throw new Error('Supabase is not configured')

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Batch inserts an array of applications (used in Migration Wizard).
 */
export async function batchInsertCloudApplications(apps, userId) {
  if (!supabase) throw new Error('Supabase is not configured')
  if (!apps || apps.length === 0) return []

  const rows = apps.map((app) => mapApplicationToRow(app, userId))
  const { data, error } = await supabase
    .from('applications')
    .insert(rows)
    .select()

  if (error) throw error
  return (data || []).map(mapRowToApplication)
}
