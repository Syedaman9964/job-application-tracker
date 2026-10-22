import { useState } from 'react'
import Modal from '../common/Modal.jsx'
import {
  STATUSES,
  EMPLOYMENT_TYPES,
  SOURCES,
} from '../../utils/storage.js'
import { getTodayDateString } from '../../utils/date.js'

export default function ApplicationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const isEditing = Boolean(initialData && initialData.id)
  const todayStr = getTodayDateString()

  // Form state
  const [company, setCompany] = useState(initialData?.company || '')
  const [role, setRole] = useState(initialData?.role || '')
  const [status, setStatus] = useState(initialData?.status || 'Applied')
  const [date, setDate] = useState(initialData?.date || todayStr)
  const [location, setLocation] = useState(initialData?.location || '')
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType || 'Full-time')
  const [source, setSource] = useState(initialData?.source || 'LinkedIn')
  const [salary, setSalary] = useState(initialData?.salary || '')
  const [jobUrl, setJobUrl] = useState(initialData?.jobUrl || '')
  const [nextFollowUp, setNextFollowUp] = useState(initialData?.nextFollowUp || '')
  const [nextFollowUpNote, setNextFollowUpNote] = useState(initialData?.nextFollowUpNote || '')
  const [interviewDate, setInterviewDate] = useState(initialData?.interviewDate || '')
  const [interviewNotes, setInterviewNotes] = useState(initialData?.interviewNotes || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [activeTab, setActiveTab] = useState('details')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!company.trim()) errs.company = 'Company name is required'
    if (!role.trim()) errs.role = 'Job role is required'
    if (!date) errs.date = 'Application date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      setActiveTab('details')
      return
    }

    const payload = {
      ...(initialData || {}),
      company: company.trim(),
      role: role.trim(),
      status,
      date,
      location: location.trim(),
      employmentType,
      source,
      salary: salary.trim(),
      jobUrl: jobUrl.trim(),
      nextFollowUp,
      nextFollowUpNote: nextFollowUpNote.trim(),
      nextFollowUpDone: initialData?.nextFollowUpDone || false,
      interviewDate,
      interviewNotes: interviewNotes.trim(),
      notes: notes.trim(),
    }

    onSubmit(payload)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Application' : 'New Job Application'}
      subtitle={
        isEditing
          ? `Updating records for ${initialData.company}`
          : 'Track a new opportunity in your pipeline'
      }
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit} className="app-modal-form" noValidate>
        {/* Form Tab Navigation */}
        <div className="form-tabs" role="tablist">
          <button
            type="button"
            className={`form-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
            role="tab"
            aria-selected={activeTab === 'details'}
          >
            Role Details
          </button>
          <button
            type="button"
            className={`form-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
            role="tab"
            aria-selected={activeTab === 'timeline'}
          >
            Timeline & Follow-ups
          </button>
          <button
            type="button"
            className={`form-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
            role="tab"
            aria-selected={activeTab === 'notes'}
          >
            Notes & Links
          </button>
        </div>

        {/* Tab 1: Primary Details */}
        {activeTab === 'details' && (
          <div className="tab-pane">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="form-company" className="form-label">
                  Company Name <span className="req">*</span>
                </label>
                <input
                  id="form-company"
                  type="text"
                  className={`form-input ${errors.company ? 'has-error' : ''}`}
                  placeholder="e.g. Stripe, Linear, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoFocus
                />
                {errors.company && (
                  <span className="field-error">{errors.company}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="form-role" className="form-label">
                  Role / Position <span className="req">*</span>
                </label>
                <input
                  id="form-role"
                  type="text"
                  className={`form-input ${errors.role ? 'has-error' : ''}`}
                  placeholder="e.g. Frontend Engineer, SDE-1"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
                {errors.role && (
                  <span className="field-error">{errors.role}</span>
                )}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="form-status" className="form-label">
                  Pipeline Stage
                </label>
                <select
                  id="form-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="form-date" className="form-label">
                  Date Applied <span className="req">*</span>
                </label>
                <input
                  id="form-date"
                  type="date"
                  className={`form-input ${errors.date ? 'has-error' : ''}`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {errors.date && (
                  <span className="field-error">{errors.date}</span>
                )}
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="form-location" className="form-label">
                  Location
                </label>
                <input
                  id="form-location"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Remote, Bengaluru"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-type" className="form-label">
                  Employment Type
                </label>
                <select
                  id="form-type"
                  className="form-select"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="form-source" className="form-label">
                  Source
                </label>
                <select
                  id="form-source"
                  className="form-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  {SOURCES.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="form-salary" className="form-label">
                Salary Range / Compensation
              </label>
              <input
                id="form-salary"
                type="text"
                className="form-input"
                placeholder="e.g. $90k - $120k or ₹12 - 16 LPA"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Timeline, Follow-ups & Interviews */}
        {activeTab === 'timeline' && (
          <div className="tab-pane">
            <div className="form-section-callout">
              <p className="callout-title">Scheduled Interviews & Action Items</p>
              <p className="callout-desc">
                Set reminders and track interview rounds to stay prepared.
              </p>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="form-next-date" className="form-label">
                  Next Action Date
                </label>
                <input
                  id="form-next-date"
                  type="date"
                  className="form-input"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-next-note" className="form-label">
                  Action Item / Reminder
                </label>
                <input
                  id="form-next-note"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Follow up with recruiter on LinkedIn"
                  value={nextFollowUpNote}
                  onChange={(e) => setNextFollowUpNote(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="form-interview-date" className="form-label">
                  Interview Date & Time
                </label>
                <input
                  id="form-interview-date"
                  type="datetime-local"
                  className="form-input"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-interview-notes" className="form-label">
                  Interview Round & Topics
                </label>
                <input
                  id="form-interview-notes"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Technical Round 1: React & System Design"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notes & Job Description */}
        {activeTab === 'notes' && (
          <div className="tab-pane">
            <div className="form-group">
              <label htmlFor="form-job-url" className="form-label">
                Job Posting URL
              </label>
              <input
                id="form-job-url"
                type="url"
                className="form-input"
                placeholder="https://company.com/careers/job-id"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="form-notes" className="form-label">
                Personal Notes & Prep Checklist
              </label>
              <textarea
                id="form-notes"
                className="form-textarea"
                rows={4}
                placeholder="Key requirements, referral contacts, questions to ask the interviewer, recruiter correspondence..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-dialog-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Save Changes' : 'Create Application'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
