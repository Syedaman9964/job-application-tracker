/**
 * Netlify Serverless Function: notify.js
 * Sends email notifications via Resend API to the verified administrator.
 * Protected by server-side authorization check.
 */

const TARGET_ADMIN_EMAIL = (
  process.env.ADMIN_NOTIFICATION_EMAIL || 'syedaman996455@gmail.com'
).toLowerCase().trim()

export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    }
  }

  // Check Resend API configuration
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    // If not configured, gracefully log and return skipped status
    console.warn('Notification skipped: RESEND_API_KEY environment variable is not configured.')
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sent: false,
        message: 'Notification skipped: RESEND_API_KEY is not configured in Netlify settings.',
      }),
    }
  }

  // Verify Authorization Bearer Header
  const authHeader = event.headers.authorization || event.headers.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized: Missing or malformed authorization token.' }),
    }
  }

  const token = authHeader.replace('Bearer ', '').trim()

  // Verify JWT token with Supabase Auth
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
      })

      if (!userRes.ok) {
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Unauthorized: Invalid authentication session.' }),
        }
      }

      const userData = await userRes.json()
      if (!userData || userData.email?.toLowerCase().trim() !== TARGET_ADMIN_EMAIL) {
        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Forbidden: Access restricted to verified administrator.' }),
        }
      }
    } catch (err) {
      console.error('Error verifying user token:', err.message)
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Authentication verification failure.' }),
      }
    }
  }

  // Parse and validate request body
  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body.' }),
    }
  }

  const { eventType, application } = payload
  const validEvents = ['create', 'update', 'status_change', 'delete']

  if (!validEvents.includes(eventType) || !application) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid notification event payload.' }),
    }
  }

  // Format email subject and content
  const eventLabels = {
    create: '🆕 New Job Application Added',
    update: '📝 Job Application Updated',
    status_change: `🔄 Stage Changed to [${application.status || 'Updated'}]`,
    delete: '🗑️ Application Removed',
  }

  const subject = `[JobTrack Alert] ${eventLabels[eventType] || 'Application Event'}: ${application.company || 'Unknown'}`
  const formattedDate = new Date().toUTCString()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'JobTrack Alerts <onboarding@resend.dev>'

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #22241d; background: #f8f7f2; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #fffefa; border: 1px solid #e6e4d9; border-radius: 8px; padding: 28px; }
          .header { border-bottom: 1px solid #eeede4; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: 700; color: #161713; margin: 0; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; background: #eef1e6; color: #5d6b42; margin-top: 8px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f2f1ea; font-size: 13px; }
          .label { color: #737467; font-weight: 500; }
          .val { color: #22241d; font-weight: 600; }
          .footer { margin-top: 24px; font-size: 11px; color: #9a9b8e; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 class="title">${eventLabels[eventType] || 'Application Notification'}</h2>
            <div class="badge">${application.company || 'Company'} — ${application.role || 'Role'}</div>
          </div>
          <div class="detail-row"><span class="label">Company:</span><span class="val">${escapeHtml(application.company)}</span></div>
          <div class="detail-row"><span class="label">Role:</span><span class="val">${escapeHtml(application.role)}</span></div>
          <div class="detail-row"><span class="label">Current Stage:</span><span class="val">${escapeHtml(application.status)}</span></div>
          ${application.location ? `<div class="detail-row"><span class="label">Location:</span><span class="val">${escapeHtml(application.location)}</span></div>` : ''}
          ${application.salary ? `<div class="detail-row"><span class="label">Salary Range:</span><span class="val">${escapeHtml(application.salary)}</span></div>` : ''}
          ${application.nextFollowUp ? `<div class="detail-row"><span class="label">Next Action Date:</span><span class="val">${escapeHtml(application.nextFollowUp)}</span></div>` : ''}
          ${application.interviewDate ? `<div class="detail-row"><span class="label">Interview Scheduled:</span><span class="val">${escapeHtml(application.interviewDate)}</span></div>` : ''}
          <div class="detail-row"><span class="label">Timestamp:</span><span class="val">${formattedDate}</span></div>
          <div class="footer">
            JobTrack Personal Career Manager · Automated Alert to ${TARGET_ADMIN_EMAIL}
          </div>
        </div>
      </body>
    </html>
  `

  // Send email via Resend API
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [TARGET_ADMIN_EMAIL],
        subject,
        html: emailHtml,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      console.error('Resend API returned error:', result)
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to dispatch email via provider.', details: result.message || 'Provider error' }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sent: true, id: result.id }),
    }
  } catch (err) {
    console.error('Error dispatching email:', err.message)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal error sending notification.' }),
    }
  }
}

function escapeHtml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
