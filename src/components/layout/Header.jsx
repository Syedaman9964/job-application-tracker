import { Menu, Plus } from 'lucide-react'

export default function Header({
  title,
  subtitle,
  onOpenAddModal,
  onToggleMobileSidebar,
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
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="header-actions">
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
