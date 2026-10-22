import {
  LayoutDashboard,
  BriefcaseBusiness,
  Kanban,
  CalendarCheck,
  Database,
  Settings,
  ShieldCheck,
  Plus,
} from 'lucide-react'

export default function Sidebar({
  currentView,
  onNavigate,
  applicationCount = 0,
  onOpenAddModal,
  mobileOpen = false,
  onCloseMobile,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: BriefcaseBusiness,
      badge: applicationCount > 0 ? applicationCount : null,
    },
    {
      id: 'kanban',
      label: 'Pipeline Board',
      icon: Kanban,
      badge: null,
    },
    {
      id: 'followups',
      label: 'Follow-ups & Dates',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'data',
      label: 'Data & Backups',
      icon: Database,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ]

  const handleNavClick = (id) => {
    onNavigate(id)
    if (onCloseMobile) onCloseMobile()
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <BriefcaseBusiness size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-name">
              JobTrack<span className="brand-period">.</span>
            </span>
            <span className="brand-tagline">Career Organizer</span>
          </div>
        </div>

        <div className="sidebar-action">
          <button
            type="button"
            className="btn btn-primary sidebar-add-btn"
            onClick={() => {
              onOpenAddModal()
              if (onCloseMobile) onCloseMobile()
            }}
          >
            <Plus size={16} />
            <span>New Application</span>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-group-label">WORKSPACE</div>
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const isActive = currentView === id
            return (
              <button
                key={id}
                type="button"
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{label}</span>
                {badge !== null && (
                  <span className="nav-badge">{badge}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-privacy-box">
          <div className="privacy-header">
            <ShieldCheck size={16} className="privacy-icon" />
            <span className="privacy-title">Local-First Storage</span>
          </div>
          <p className="privacy-desc">
            Your application data never leaves this browser. Back up regularly via JSON export.
          </p>
        </div>

        <div className="sidebar-footer">
          <span>JobTrack · v2.0</span>
          <span className="status-indicator">
            <span className="indicator-dot" /> Ready
          </span>
        </div>
      </aside>
    </>
  )
}
