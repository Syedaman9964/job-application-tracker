import { useState, useMemo } from 'react'
import {
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Pencil,
  ArrowRight,
} from 'lucide-react'
import {
  formatDisplayDate,
  getDueStatusLabel,
  isOverdue,
  isToday,
  isWithinCurrentWeek,
} from '../../utils/date.js'
import Badge from '../common/Badge.jsx'
import EmptyState from '../common/EmptyState.jsx'

export default function FollowUpHub({
  applications,
  onToggleFollowUp,
  onViewDetails,
  onEdit,
}) {
  const [filter, setFilter] = useState('active') // 'active' | 'overdue' | 'week' | 'interviews' | 'completed'

  const allItems = useMemo(() => {
    const list = []

    applications.forEach((app) => {
      // Follow-up task
      if (app.nextFollowUp) {
        list.push({
          id: `${app.id}-followup`,
          appId: app.id,
          application: app,
          type: 'followup',
          date: app.nextFollowUp,
          note: app.nextFollowUpNote || 'Follow up on application status',
          isDone: Boolean(app.nextFollowUpDone),
          isOverdue: isOverdue(app.nextFollowUp),
          isToday: isToday(app.nextFollowUp),
          isThisWeek: isWithinCurrentWeek(app.nextFollowUp),
        })
      }

      // Scheduled interview
      if (app.interviewDate) {
        const interviewDay = app.interviewDate.slice(0, 10)
        list.push({
          id: `${app.id}-interview`,
          appId: app.id,
          application: app,
          type: 'interview',
          date: app.interviewDate,
          note: app.interviewNotes || 'Scheduled interview round',
          isDone: false,
          isOverdue: isOverdue(interviewDay),
          isToday: isToday(interviewDay),
          isThisWeek: isWithinCurrentWeek(interviewDay),
        })
      }
    })

    // Sort by date ascending
    list.sort((a, b) => a.date.localeCompare(b.date))
    return list
  }, [applications])

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'overdue':
        return allItems.filter((item) => item.isOverdue && !item.isDone)
      case 'week':
        return allItems.filter((item) => item.isThisWeek && !item.isDone)
      case 'interviews':
        return allItems.filter((item) => item.type === 'interview')
      case 'completed':
        return allItems.filter((item) => item.isDone)
      case 'active':
      default:
        return allItems.filter((item) => !item.isDone)
    }
  }, [allItems, filter])

  return (
    <div className="followups-view-container">
      {/* Top Filter Buttons */}
      <div className="followups-filter-bar">
        <button
          type="button"
          className={`filter-chip ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active Tasks ({allItems.filter((i) => !i.isDone).length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          This Week ({allItems.filter((i) => i.isThisWeek && !i.isDone).length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filter === 'overdue' ? 'active' : ''}`}
          onClick={() => setFilter('overdue')}
        >
          Overdue ({allItems.filter((i) => i.isOverdue && !i.isDone).length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filter === 'interviews' ? 'active' : ''}`}
          onClick={() => setFilter('interviews')}
        >
          Interviews ({allItems.filter((i) => i.type === 'interview').length})
        </button>
        <button
          type="button"
          className={`filter-chip ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({allItems.filter((i) => i.isDone).length})
        </button>
      </div>

      {/* Task List or Empty State */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No action items found"
          description={
            filter === 'completed'
              ? 'You have not marked any follow-up tasks as completed yet.'
              : 'You have no action items matching this filter. Schedule a follow-up or interview round on an application to track it here.'
          }
        />
      ) : (
        <div className="followups-list-stack">
          {filteredItems.map((item) => {
            const dueLabel = getDueStatusLabel(item.date.slice(0, 10))

            return (
              <div
                key={item.id}
                className={`followup-card-item ${item.isDone ? 'is-completed' : ''} ${item.type === 'interview' ? 'is-interview' : ''}`}
              >
                {/* Left check / type icon */}
                <div className="followup-type-column">
                  {item.type === 'interview' ? (
                    <div className="interview-symbol-wrap" title="Interview Round">
                      <Calendar size={18} />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`task-checkbox-btn ${item.isDone ? 'checked' : ''}`}
                      onClick={() => onToggleFollowUp(item.appId)}
                      title={item.isDone ? 'Mark as incomplete' : 'Mark as done'}
                      aria-label="Toggle task completion"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="followup-content-column">
                  <div className="followup-title-row">
                    <button
                      type="button"
                      className="followup-company-link"
                      onClick={() => onViewDetails(item.application)}
                    >
                      {item.application.company}
                    </button>
                    <span className="followup-role-label">
                      · {item.application.role}
                    </span>
                    <Badge variant={item.application.status}>
                      {item.application.status}
                    </Badge>
                  </div>

                  <p className="followup-note-text">{item.note}</p>

                  <div className="followup-meta-footer">
                    <span className="followup-date-string">
                      <Clock size={13} />
                      {item.type === 'interview'
                        ? `Interview: ${item.date.replace('T', ' at ')}`
                        : `Target Date: ${formatDisplayDate(item.date)}`}
                    </span>
                    {dueLabel && !item.isDone && (
                      <span
                        className={`followup-due-tag ${dueLabel.includes('Overdue') ? 'overdue' : 'normal'}`}
                      >
                        {dueLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="followup-actions-column">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEdit(item.application)}
                    title="Edit task or application"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onViewDetails(item.application)}
                    title="View full details"
                  >
                    <span>View</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
