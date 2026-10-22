import { supabase } from './supabaseClient.js'

/**
 * Triggers an asynchronous email notification to the administrator.
 * Non-blocking: failures in notification delivery do not disrupt application saves.
 */
export async function sendAdminNotification(eventType, application) {
  try {
    // Only attempt if running in an environment with Netlify functions available
    if (typeof window === 'undefined') return

    // Get current session token if available
    let token = ''
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      token = data?.session?.access_token || ''
    }

    // Call the serverless function
    const res = await fetch('/.netlify/functions/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        eventType,
        application: {
          id: application.id,
          company: application.company,
          role: application.role,
          status: application.status,
          location: application.location,
          salary: application.salary,
          nextFollowUp: application.nextFollowUp,
          interviewDate: application.interviewDate,
        },
      }),
    })

    if (!res.ok) {
      // In local development or before Netlify env vars are configured, this may return 404/skipped.
      // We log gracefully and never throw to avoid disrupting the UI.
      const errData = await res.json().catch(() => ({}))
      console.warn('Admin notification notice:', errData.message || res.statusText)
    }
  } catch (err) {
    // Network or function offline notice
    console.warn('Could not contact notification service:', err.message)
  }
}
