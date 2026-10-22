import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
} from 'lucide-react'
import EmptyState from '../common/EmptyState.jsx'
import { STATUSES, EMPLOYMENT_TYPES } from '../../utils/storage.js'
import { formatDisplayDate, getDueStatusLabel } from '../../utils/date.js'

export default function ApplicationsTable({
  applications,
  onViewDetails,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenAddModal,
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Filtered & sorted applications
  const filteredApps = useMemo(() => {
    let result = [...applications]

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (app) =>
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          app.location.toLowerCase().includes(q) ||
          app.notes.toLowerCase().includes(q),
      )
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter((app) => app.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'All') {
      result = result.filter((app) => app.employmentType === typeFilter)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date)
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date)
      if (sortBy === 'company-asc') return a.company.localeCompare(b.company)
      if (sortBy === 'company-desc') return b.company.localeCompare(a.company)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      return 0
    })

    return result
  }, [applications, search, statusFilter, typeFilter, sortBy])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / pageSize))
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredApps.slice(start, start + pageSize)
  }, [filteredApps, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setTypeFilter('All')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  return (
    <div className="applications-table-view">
      {/* Top Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-field-wrap">
          <Search size={16} className="search-field-icon" />
          <input
            type="search"
            className="search-field-input"
            placeholder="Search by company, role, location, or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
          />
          {search && (
            <button
              type="button"
              className="search-field-clear"
              onClick={() => {
                setSearch('')
                setCurrentPage(1)
              }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-controls-group">
          <div className="control-select-wrap">
            <Filter size={14} className="control-icon" />
            <select
              className="control-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filter by stage"
            >
              <option value="All">All Stages</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="control-select-wrap">
            <select
              className="control-select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filter by employment type"
            >
              <option value="All">All Types</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="control-select-wrap">
            <ArrowUpDown size={14} className="control-icon" />
            <select
              className="control-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort applications"
            >
              <option value="date-desc">Newest Applied</option>
              <option value="date-asc">Oldest Applied</option>
              <option value="company-asc">Company (A-Z)</option>
              <option value="company-desc">Company (Z-A)</option>
              <option value="status">By Stage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="table-meta-bar">
        <span className="results-count">
          Showing <strong>{filteredApps.length}</strong> of{' '}
          <strong>{applications.length}</strong> applications
        </span>
        {(search || statusFilter !== 'All' || typeFilter !== 'All') && (
          <button
            type="button"
            className="btn-text-action"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table Content or Empty State */}
      {filteredApps.length === 0 ? (
        applications.length === 0 ? (
          <EmptyState
            title="No applications tracked yet"
            description="Start building your pipeline by adding your first job application."
            actionLabel="Add Application"
            onAction={onOpenAddModal}
          />
        ) : (
          <EmptyState
            title="No matching applications"
            description="None of your saved applications match the selected filters or search terms."
            actionLabel="Clear Filters"
            onAction={handleResetFilters}
          />
        )
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Company & Role</th>
                <th scope="col">Date Applied</th>
                <th scope="col">Stage</th>
                <th scope="col">Upcoming / Action</th>
                <th scope="col" className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.map((app) => {
                const dueLabel = app.nextFollowUp
                  ? getDueStatusLabel(app.nextFollowUp)
                  : null

                return (
                  <tr key={app.id} className="table-row">
                    {/* Company & Role */}
                    <td>
                      <div className="table-company-cell">
                        <span className="table-avatar">
                          {app.company.charAt(0).toUpperCase()}
                        </span>
                        <div className="company-text-meta">
                          <div className="company-title-row">
                            <button
                              type="button"
                              className="company-name-btn"
                              onClick={() => onViewDetails(app)}
                            >
                              {app.company}
                            </button>
                            {app.jobUrl && (
                              <a
                                href={app.jobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link-icon"
                                title="Open Job Posting"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <span className="table-role">{app.role}</span>
                          <div className="table-tags-row">
                            {app.location && (
                              <span className="table-subtag">{app.location}</span>
                            )}
                            <span className="table-subtag">
                              {app.employmentType}
                            </span>
                            {app.salary && (
                              <span className="table-subtag salary-tag">
                                {app.salary}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date Applied */}
                    <td>
                      <span className="table-date">
                        {formatDisplayDate(app.date)}
                      </span>
                    </td>

                    {/* Status with Quick Select */}
                    <td>
                      <div className="table-status-cell">
                        <select
                          className={`table-status-select badge-${app.status.toLowerCase()}`}
                          value={app.status}
                          onChange={(e) =>
                            onStatusChange(app.id, e.target.value)
                          }
                          aria-label={`Update status for ${app.company}`}
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Follow-up / Interview Action */}
                    <td>
                      {app.interviewDate ? (
                        <div className="table-action-pill interview">
                          <Calendar size={13} />
                          <span>Interview scheduled</span>
                        </div>
                      ) : dueLabel && !app.nextFollowUpDone ? (
                        <div
                          className={`table-action-pill ${dueLabel.includes('Overdue') ? 'overdue' : 'normal'}`}
                        >
                          <span>{dueLabel}</span>
                        </div>
                      ) : (
                        <span className="table-muted-text">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="table-actions-cluster">
                        <button
                          type="button"
                          className="table-icon-btn view"
                          onClick={() => onViewDetails(app)}
                          title="View Details"
                          aria-label={`View details for ${app.company}`}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-icon-btn edit"
                          onClick={() => onEdit(app)}
                          title="Edit Application"
                          aria-label={`Edit ${app.company}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-icon-btn delete"
                          onClick={() => onDelete(app.id)}
                          title="Delete Application"
                          aria-label={`Delete ${app.company}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
