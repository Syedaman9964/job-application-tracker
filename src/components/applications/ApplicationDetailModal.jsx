import {
  ExternalLink,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react'
import Modal from '../common/Modal.jsx'
import Badge from '../common/Badge.jsx'
import { formatDisplayDate, getDueStatusLabel } from '../../utils/date.js'
import { STATUSES } from '../../utils/storage.js'

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleFollowUp,
}) {
  if (!isOpen || !application) return null

  const dueLabel = application.nextFollowUp
    ? getDueStatusLabel(application.nextFollowUp)
    : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application.company}
      subtitle={application.role}
      maxWidth="620px"
    >
      <div className="app-detail-view">
        {/* Top Header Row with Status & Quick Actions */}
        <div className="detail-top-bar">
          <div className="detail-status-select-wrap">
            <span className="detail-label">Current Stage:</span>
            <select
              className="detail-status-select"
              value={application.status}
              onChange={(e) => onStatusChange(application.id, e.target.value)}
              aria-label="Change application stage"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="detail-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onEdit(application)
                onClose()
              }}
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              onClick={() => {
                onDelete(application.id)
                onClose()
              }}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Key Attributes Grid */}
        <div className="detail-attributes-grid">
          <div className="attribute-item">
            <Calendar size={16} className="attr-icon" />
            <div>
              <span className="attr-label">Applied Date</span>
              <span className="attr-value">
                {formatDisplayDate(application.date)}
              </span>
            </div>
          </div>

          <div className="attribute-item">
            <MapPin size={16} className="attr-icon" />
            <div>
              <span className="attr-label">Location</span>
              <span className="attr-value">
                {application.location || 'Not specified'}
              </span>
            </div>
          </div>

          <div className="attribute-item">
            <DollarSign size={16} className="attr-icon" />
            <div>
              <span className="attr-label">Compensation</span>
              <span className="attr-value">
                {application.salary || 'Not specified'}
              </span>
            </div>
          </div>

          <div className="attribute-item">
            <Clock size={16} className="attr-icon" />
            <div>
              <span className="attr-label">Employment Type</span>
              <span className="attr-value">
                {application.employmentType || 'Full-time'}
              </span>
            </div>
          </div>
        </div>

        {/* Source & Link */}
        <div className="detail-meta-row">
          <span className="meta-tag">Source: {application.source || 'Other'}</span>
          {application.jobUrl && (
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-job-link"
            >
              <span>View Job Posting</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Next Action / Follow-up Card */}
        {application.nextFollowUp && (
          <div className="detail-callout-card">
            <div className="callout-header">
              <div className="callout-title-wrap">
                <CheckCircle size={16} className="callout-icon" />
                <strong>Next Action Item</strong>
              </div>
              {dueLabel && (
                <Badge variant={dueLabel.includes('Overdue') ? 'rejected' : 'interview'}>
                  {dueLabel}
                </Badge>
              )}
            </div>
            <p className="callout-content">
              {application.nextFollowUpNote || 'Follow up on application status.'}
            </p>
            <div className="callout-footer">
              <span className="callout-date">
                Due: {formatDisplayDate(application.nextFollowUp)}
              </span>
              <button
                type="button"
                className={`btn btn-sm ${application.nextFollowUpDone ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => onToggleFollowUp(application.id)}
              >
                {application.nextFollowUpDone ? 'Mark as Incomplete' : 'Mark as Done'}
              </button>
            </div>
          </div>
        )}

        {/* Scheduled Interview Card */}
        {application.interviewDate && (
          <div className="detail-callout-card interview-callout">
            <div className="callout-header">
              <div className="callout-title-wrap">
                <Calendar size={16} className="callout-icon" />
                <strong>Scheduled Interview</strong>
              </div>
              <Badge variant="interview">Scheduled</Badge>
            </div>
            <p className="callout-content">
              {application.interviewNotes || 'General interview round'}
            </p>
            <span className="callout-date">
              Scheduled for: {application.interviewDate.replace('T', ' at ')}
            </span>
          </div>
        )}

        {/* Personal Notes */}
        {application.notes ? (
          <div className="detail-notes-section">
            <div className="notes-header">
              <FileText size={16} />
              <strong>Notes & Preparation</strong>
            </div>
            <div className="notes-body">{application.notes}</div>
          </div>
        ) : (
          <div className="detail-no-notes">
            <span>No additional notes for this application.</span>
          </div>
        )}
      </div>
    </Modal>
  )
}
