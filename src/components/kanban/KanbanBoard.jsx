import { useState } from 'react'
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react'
import { STATUSES } from '../../utils/storage.js'
import { formatDisplayDate, getDueStatusLabel } from '../../utils/date.js'

export default function KanbanBoard({
  applications,
  onStatusChange,
  onViewDetails,
  onOpenAddModal,
}) {
  const [draggedAppId, setDraggedAppId] = useState(null)
  const [activeDropColumn, setActiveDropColumn] = useState(null)

  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId)
    e.dataTransfer.setData('text/plain', appId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (activeDropColumn !== status) {
      setActiveDropColumn(status)
    }
  }

  const handleDragLeave = () => {
    setActiveDropColumn(null)
  }

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    setActiveDropColumn(null)
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId
    if (appId) {
      onStatusChange(appId, targetStatus)
    }
    setDraggedAppId(null)
  }

  return (
    <div className="kanban-view-container">
      <div className="kanban-columns-track">
        {STATUSES.map((status) => {
          const columnApps = applications.filter((app) => app.status === status)
          const isDropActive = activeDropColumn === status

          return (
            <div
              key={status}
              className={`kanban-column ${isDropActive ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="column-title-group">
                  <span className={`column-status-indicator status-${status.toLowerCase()}`} />
                  <h3 className="column-title">{status}</h3>
                </div>
                <span className="column-count-badge">
                  {columnApps.length}
                </span>
              </div>

              {/* Quick Add into this column */}
              <button
                type="button"
                className="kanban-quick-add-btn"
                onClick={() => onOpenAddModal({ status })}
              >
                <Plus size={14} />
                <span>Add {status}</span>
              </button>

              {/* Column Cards */}
              <div className="kanban-cards-stack">
                {columnApps.length === 0 ? (
                  <div className="kanban-column-empty">
                    <span>No applications in {status}</span>
                  </div>
                ) : (
                  columnApps.map((app) => {
                    const dueLabel = app.nextFollowUp
                      ? getDueStatusLabel(app.nextFollowUp)
                      : null

                    return (
                      <div
                        key={app.id}
                        className={`kanban-card ${draggedAppId === app.id ? 'is-dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onClick={() => onViewDetails(app)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onViewDetails(app)
                          }
                        }}
                      >
                        <div className="kanban-card-top">
                          <span className="kanban-company-avatar">
                            {app.company.charAt(0).toUpperCase()}
                          </span>
                          <div className="kanban-card-header-text">
                            <h4 className="kanban-card-company">{app.company}</h4>
                            <p className="kanban-card-role">{app.role}</p>
                          </div>
                        </div>

                        {/* Location, Salary & Type */}
                        <div className="kanban-meta-tags">
                          {app.location && (
                            <span className="kanban-subtag">
                              <MapPin size={11} /> {app.location}
                            </span>
                          )}
                          {app.salary && (
                            <span className="kanban-subtag salary">
                              {app.salary}
                            </span>
                          )}
                        </div>

                        {/* Follow-up / Interview Pill */}
                        {app.interviewDate ? (
                          <div className="kanban-action-alert interview">
                            <Calendar size={12} />
                            <span>Interview: {app.interviewDate.slice(0, 10)}</span>
                          </div>
                        ) : dueLabel && !app.nextFollowUpDone ? (
                          <div
                            className={`kanban-action-alert ${dueLabel.includes('Overdue') ? 'overdue' : 'normal'}`}
                          >
                            <Clock size={12} />
                            <span>{dueLabel}</span>
                          </div>
                        ) : null}

                        {/* Card Footer: Date & Quick Move */}
                        <div
                          className="kanban-card-footer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="kanban-date">
                            {formatDisplayDate(app.date)}
                          </span>

                          <div className="kanban-move-select-wrap">
                            <select
                              className="kanban-move-select"
                              value={app.status}
                              onChange={(e) =>
                                onStatusChange(app.id, e.target.value)
                              }
                              aria-label={`Move ${app.company} to different stage`}
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  Move to {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
