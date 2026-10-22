import { useState } from 'react'
import {
  Sliders,
  Sparkles,
  Info,
  Check,
  ExternalLink,
  ShieldCheck,
  LogOut,
} from 'lucide-react'

export default function SettingsView({
  settings,
  onSaveSettings,
  onLoadSampleData,
  onShowToast,
  adminEmail = 'syedaman996455@gmail.com',
  isCloudConfigured = false,
  onSignOut,
}) {
  const [defaultView, setDefaultView] = useState(settings.defaultView || 'dashboard')
  const [weeklyGoal, setWeeklyGoal] = useState(settings.weeklyGoal || 5)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    onSaveSettings({
      defaultView,
      weeklyGoal: Math.max(1, parseInt(weeklyGoal, 10) || 5),
    })
    setSavedSuccess(true)
    onShowToast('Preferences saved successfully.', 'success')
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="settings-view-container">
      <form onSubmit={handleSave} className="settings-form">
        {/* Preference Settings Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-icon">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="settings-title">Application Preferences</h3>
              <p className="settings-subtitle">
                Customize your workflow defaults and personal goals
              </p>
            </div>
          </div>

          <div className="settings-fields-group">
            <div className="settings-field-row">
              <label htmlFor="settings-default-view" className="settings-field-label">
                Default Landing View
                <span className="settings-field-desc">
                  The screen opened when launching the tracker
                </span>
              </label>
              <select
                id="settings-default-view"
                className="settings-select"
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
              >
                <option value="dashboard">Dashboard Overview</option>
                <option value="applications">Applications Table</option>
                <option value="kanban">Pipeline Kanban Board</option>
                <option value="followups">Follow-ups & Action Items</option>
              </select>
            </div>

            <div className="settings-field-row">
              <label htmlFor="settings-weekly-goal" className="settings-field-label">
                Weekly Application Target
                <span className="settings-field-desc">
                  Target number of new applications to submit each week
                </span>
              </label>
              <div className="number-input-wrap">
                <input
                  id="settings-weekly-goal"
                  type="number"
                  min="1"
                  max="50"
                  className="settings-number-input"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(e.target.value)}
                />
                <span className="unit-label">apps / week</span>
              </div>
            </div>
          </div>

          <div className="settings-actions-footer">
            <button type="submit" className="btn btn-primary">
              {savedSuccess ? (
                <>
                  <Check size={16} /> <span>Saved!</span>
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </div>

        {/* Demo Data & Portfolio Evaluator Tool */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-header-icon highlight">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="settings-title">Portfolio Evaluation / Demo Data</h3>
              <p className="settings-subtitle">
                Load high-fidelity demonstration records to preview all pipeline stages
              </p>
            </div>
          </div>
          <div className="settings-demo-body">
            <p className="demo-desc">
              Populates your tracker with 5 realistic applications (Stripe, Linear, Vercel, Datadog, Raycast) across different pipeline stages, salaries, upcoming interviews, and scheduled reminders.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onLoadSampleData()
                onShowToast('Curated demonstration data loaded.', 'success')
              }}
            >
              <Sparkles size={16} />
              <span>Load Curated Demo Applications</span>
            </button>
          </div>
        </div>

        {/* Administrator Security & Access Control */}
        <div className="settings-card security-card">
          <div className="settings-card-header">
            <div className="settings-header-icon security">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="settings-title">Administrator Security & Access</h3>
              <p className="settings-subtitle">
                Single-admin protection policy and authentication status
              </p>
            </div>
          </div>
          <div className="security-card-body">
            <div className="security-detail-row">
              <span className="sec-label">Designated Administrator:</span>
              <span className="sec-val"><strong>{adminEmail}</strong></span>
            </div>
            <div className="security-detail-row">
              <span className="sec-label">Access Policy:</span>
              <span className="sec-val">Deny by default (public signups disabled)</span>
            </div>
            <div className="security-detail-row">
              <span className="sec-label">Database Security:</span>
              <span className="sec-val">
                {isCloudConfigured ? '✅ Row Level Security (RLS) Active' : '⚡ Local Storage Mode (Unconnected)'}
              </span>
            </div>
            {onSignOut && (
              <div className="security-action-row">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onSignOut}
                >
                  <LogOut size={14} />
                  <span>Sign Out of Administrator Session</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* About & Technical Architecture */}
        <div className="settings-card about-card">
          <div className="settings-card-header">
            <div className="settings-header-icon neutral">
              <Info size={18} />
            </div>
            <div>
              <h3 className="settings-title">About JobTrack</h3>
              <p className="settings-subtitle">
                Software Engineering Portfolio Project
              </p>
            </div>
          </div>
          <div className="about-content">
            <p>
              <strong>JobTrack</strong> is built with React 19, Vite, Recharts, and custom Vanilla CSS. It provides personal job-search management following a local-first architecture where data is 100% private to the client.
            </p>
            <div className="about-tech-stack">
              <span className="tech-badge">React 19</span>
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">Recharts</span>
              <span className="tech-badge">Lucide Icons</span>
              <span className="tech-badge">Vanilla CSS</span>
              <span className="tech-badge">Vitest</span>
            </div>
            <div className="about-links">
              <a
                href="https://github.com/Syedaman9964/job-application-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="about-github-link"
              >
                <ExternalLink size={14} />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
