import { useState, useEffect } from 'react'
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  supabase,
  isSupabaseConfigured,
  isAdminUser,
  signInAdmin,
  signOutAdmin,
  requestPasswordReset,
  TARGET_ADMIN_EMAIL,
} from '../../utils/supabaseClient.js'

export default function AdminAuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(() => isSupabaseConfigured())
  const [email, setEmail] = useState(TARGET_ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  // Listen for Supabase Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      return
    }

    // Check initial active session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession)
      setLoading(false)
    })

    // Subscribe to auth state updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthSuccess('')
    setIsSubmitting(true)

    try {
      await signInAdmin(email, password)
      setAuthSuccess('Administrator verified successfully.')
    } catch (err) {
      setAuthError(err.message || 'Failed to authenticate administrator.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthSuccess('')
    setIsSubmitting(true)

    try {
      await requestPasswordReset(email)
      setAuthSuccess(`Password reset email sent to ${TARGET_ADMIN_EMAIL}. Check your inbox.`)
    } catch (err) {
      setAuthError(err.message || 'Failed to send password reset email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <p>Verifying secure administrator session...</p>
      </div>
    )
  }

  // Fail-Closed: If Supabase credentials are not configured, block access to private pipeline data
  if (!isSupabaseConfigured()) {
    return (
      <div className="auth-gate-screen">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-wrap">
              <Lock size={24} />
            </div>
            <h2 className="auth-title">Backend Configuration Required</h2>
            <p className="auth-subtitle">
              JobTrack is locked. Cloud security credentials are required to authenticate the administrator and access this pipeline.
            </p>
          </div>

          <div className="admin-email-pill">
            <ShieldCheck size={14} className="pill-icon" />
            <span>Target Administrator: <strong>{TARGET_ADMIN_EMAIL}</strong></span>
          </div>

          <div className="auth-alert error" role="alert">
            <AlertCircle size={16} />
            <span>Missing or invalid Supabase credentials in <code>.env.local</code>.</span>
          </div>

          <div
            style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted, #737467)',
              textAlign: 'left',
              background: 'var(--bg-muted, #f4f3ec)',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, #eeede4)',
              margin: '16px 0',
            }}
          >
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-primary, #161713)' }}>
              Required Setup Steps:
            </p>
            <ol style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Create <code>.env.local</code> in the project root directory.</li>
              <li>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</li>
              <li>Restart the dev server (<code>npm run dev</code>).</li>
            </ol>
          </div>

          <div className="auth-footer-notice">
            <span>Fail-Closed Security Active</span>
            <span>Private pipeline data is protected from unauthenticated access.</span>
          </div>
        </div>
      </div>
    )
  }

  // Unauthorized Account Logged In (Email does not match TARGET_ADMIN_EMAIL)
  if (session && !isAdminUser(session.user)) {
    return (
      <div className="auth-gate-screen">
        <div className="auth-card access-denied">
          <div className="auth-icon-wrap danger">
            <ShieldAlert size={28} />
          </div>
          <h2 className="auth-title">403 Access Denied</h2>
          <p className="auth-subtitle">
            Authenticated as <strong>{session.user.email}</strong>, which does not match the designated administrator account (<strong>{TARGET_ADMIN_EMAIL}</strong>).
          </p>
          <div className="auth-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => signOutAdmin()}
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is not authenticated: Render Secure Admin Login Screen
  if (!session) {
    return (
      <div className="auth-gate-screen">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-wrap">
              <Lock size={24} />
            </div>
            <h2 className="auth-title">Administrator Access</h2>
            <p className="auth-subtitle">
              Sign in with your verified administrator credentials to access your career pipeline.
            </p>
          </div>

          <div className="admin-email-pill">
            <ShieldCheck size={14} className="pill-icon" />
            <span>Authorized: <strong>{TARGET_ADMIN_EMAIL}</strong></span>
          </div>

          {authError && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="auth-alert success" role="alert">
              <CheckCircle2 size={16} />
              <span>{authSuccess}</span>
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handleLogin} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="admin-email-input" className="form-label">
                  Administrator Email
                </label>
                <input
                  id="admin-email-input"
                  type="email"
                  className="form-input disabled-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly
                  aria-label="Administrator Email (locked)"
                />
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="admin-password-input" className="form-label">
                    Master Password
                  </label>
                  <button
                    type="button"
                    className="link-subtle"
                    onClick={() => {
                      setShowForgot(true)
                      setAuthError('')
                      setAuthSuccess('')
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="password-input-wrap">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit-btn"
                disabled={isSubmitting || !password}
              >
                {isSubmitting ? (
                  'Verifying Credentials...'
                ) : (
                  <>
                    <span>Unlock Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="reset-email-input" className="form-label">
                  Send Recovery Link To
                </label>
                <input
                  id="reset-email-input"
                  type="email"
                  className="form-input disabled-input"
                  value={email}
                  readOnly
                />
              </div>

              <div className="auth-form-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForgot(false)
                    setAuthError('')
                    setAuthSuccess('')
                  }}
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  <KeyRound size={15} />
                  <span>Send Recovery Email</span>
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer-notice">
            <span>Client Row Level Security (RLS) Protected</span>
            <span>Unauthorized access attempts are blocked and logged.</span>
          </div>
        </div>
      </div>
    )
  }

  // Administrator is verified: Render protected application
  return children
}
