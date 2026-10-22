import { Menu, Plus, Cloud, HardDrive, LogOut } from 'lucide-react'

export default function Header({
  title,
  subtitle,
  onOpenAddModal,
  onToggleMobileSidebar,
  isCloudMode = false,
  isSyncing = false,
  adminEmail = 'syedaman996455@gmail.com',
  onSignOut,
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="header-title-row">
            <h1 className="header-title">{title}</h1>
            <div className={`status-pill ${isCloudMode ? 'cloud' : 'local'}`}>
              {isCloudMode ? (
                <>
                  <Cloud size={13} className={isSyncing ? 'spinning' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Cloud RLS'}</span>
                </>
              ) : (
                <>
                  <HardDrive size={13} />
                  <span>Local Mode</span>
                </>
              )}
            </div>
          </div>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-actions">
        {onSignOut && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onSignOut}
            title={`Sign out (${adminEmail})`}
          >
            <LogOut size={14} />
            <span className="hide-on-mobile">Sign Out</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenAddModal}
        >
          <Plus size={16} />
          <span>Add Application</span>
        </button>
      </div>
    </header>
  )
}
