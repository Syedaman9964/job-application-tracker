import { useMemo } from 'react'
import {
  BriefcaseBusiness,
  CalendarCheck,
  Trophy,
  Activity,
  Target,
  ArrowUpRight,
  CheckCircle,
  Plus,
  Sparkles,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { STATUSES } from '../../utils/storage.js'
import {
  formatDisplayDate,
  getDueStatusLabel,
  isOverdue,
  isUpcoming,
  isWithinCurrentWeek,
} from '../../utils/date.js'
import Badge from '../common/Badge.jsx'

const STATUS_COLORS = {
  Wishlist: '#64748b',
  Applied: '#33617b',
  Interview: '#d97706',
  Offer: '#16a34a',
  Rejected: '#dc2626',
}

export default function DashboardView({
  applications,
  weeklyGoal = 5,
  onNavigate,
  onOpenAddModal,
  onLoadSampleData,
  onToggleFollowUp,
  onViewDetails,
}) {
  // Compute true data-driven counts
  const counts = useMemo(() => {
    const acc = { Wishlist: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 }
    applications.forEach((app) => {
      if (acc[app.status] !== undefined) {
        acc[app.status] += 1
      }
    })
    return acc
  }, [applications])

  // Applications submitted this week
  const appliedThisWeek = useMemo(() => {
    return applications.filter((app) => isWithinCurrentWeek(app.date)).length
  }, [applications])

  // Conversion rate (Interview + Offer / Total active attempts)
  const conversionRate = useMemo(() => {
    const totalAttempted = applications.filter((a) => a.status !== 'Wishlist').length
    if (totalAttempted === 0) return 0
    const successfulStages = counts.Interview + counts.Offer
    return Math.round((successfulStages / totalAttempted) * 100)
  }, [applications, counts])

  // Active in progress
  const activeCount = counts.Applied + counts.Interview

  // Upcoming follow-ups and interviews
  const urgentActions = useMemo(() => {
    return applications
      .filter((app) => {
        if (app.interviewDate) return true
        if (app.nextFollowUp && !app.nextFollowUpDone) {
          return isOverdue(app.nextFollowUp) || isUpcoming(app.nextFollowUp, 7)
        }
        return false
      })
      .slice(0, 5)
  }, [applications])

  // Recent 4 applications
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4)
  }, [applications])

  // Chart data
  const pieChartData = useMemo(() => {
    return STATUSES.map((status) => ({
      name: status,
      value: counts[status] || 0,
      color: STATUS_COLORS[status],
    })).filter((item) => item.value > 0)
  }, [counts])

  const barChartData = useMemo(() => {
    return STATUSES.map((status) => ({
      stage: status,
      count: counts[status] || 0,
    }))
  }, [counts])

  const goalPercent = Math.min(100, Math.round((appliedThisWeek / Math.max(1, weeklyGoal)) * 100))

  return (
    <div className="dashboard-content">
      {/* Zero State Callout if Empty */}
      {applications.length === 0 && (
        <div className="dashboard-starter-banner">
          <div className="starter-banner-text">
            <h3>Welcome to JobTrack!</h3>
            <p>
              Your personal pipeline is currently clear. Add your first job application, or load realistic sample applications to explore all dashboard features immediately.
            </p>
          </div>
          <div className="starter-banner-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onLoadSampleData}
            >
              <Sparkles size={14} />
              <span>Load Sample Data</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onOpenAddModal()}
            >
              <Plus size={14} />
              <span>Add First Application</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <section className="kpi-metrics-grid" aria-label="Key Metrics">
        <div className="kpi-card">
          <div className="kpi-icon-wrap neutral">
            <BriefcaseBusiness size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Total Applications</span>
            <span className="kpi-value">{applications.length}</span>
            <span className="kpi-subtext">Tracked in this browser</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap in-progress">
            <Activity size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Active in Pipeline</span>
            <span className="kpi-value">{activeCount}</span>
            <span className="kpi-subtext">Applied & Interviewing</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap interview">
            <CalendarCheck size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Interviews</span>
            <span className="kpi-value">{counts.Interview}</span>
            <span className="kpi-subtext">Rounds in progress</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap offer">
            <Trophy size={20} />
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Offers Received</span>
            <span className="kpi-value">{counts.Offer}</span>
            <span className="kpi-subtext">
              {applications.length > 0 ? `${conversionRate}% conversion rate` : 'Awaiting results'}
            </span>
          </div>
        </div>
      </section>

      {/* Weekly Goal Progress Bar */}
      <section className="weekly-goal-card">
        <div className="goal-card-top">
          <div className="goal-title-wrap">
            <Target size={18} className="goal-icon" />
            <div>
              <strong className="goal-title">Weekly Application Target</strong>
              <p className="goal-subtitle">
                {appliedThisWeek} of {weeklyGoal} applications logged this week
              </p>
            </div>
          </div>
          <span className="goal-percentage">{goalPercent}%</span>
        </div>
        <div className="goal-progress-track">
          <div
            className="goal-progress-fill"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="analytics-section-grid">
        {/* Pipeline Distribution Donut */}
        <div className="chart-card-panel">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Pipeline Breakdown</h3>
              <p className="chart-subtitle">Applications distributed by stage</p>
            </div>
          </div>
          {pieChartData.length === 0 ? (
            <div className="chart-empty-state">
              <span>No applications to chart yet.</span>
            </div>
          ) : (
            <div className="donut-chart-container">
              <div className="donut-recharts-wrap">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={82}
                      paddingAngle={3}
                    >
                      {pieChartData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-metric">
                  <span className="donut-total">{applications.length}</span>
                  <span className="donut-label">Total</span>
                </div>
              </div>

              <div className="donut-legend-grid">
                {STATUSES.map((status) => (
                  <div key={status} className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                    <span className="legend-label">{status}</span>
                    <strong className="legend-val">{counts[status] || 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stage Comparison Bar Chart */}
        <div className="chart-card-panel">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">Stage Comparison</h3>
              <p className="chart-subtitle">Volume across pipeline stages</p>
            </div>
          </div>
          <div className="barchart-container">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={barChartData}
                margin={{ top: 12, right: 8, left: -22, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8e6dc"
                />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: '#737467' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#737467' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Applications"
                  fill="#5d6b42"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Urgent Actions & Recent Applications */}
      <section className="dashboard-dual-grid">
        {/* Urgent Actions & Deadlines */}
        <div className="dashboard-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">Upcoming Actions & Deadlines</h3>
              <p className="panel-subtitle">Follow-ups and scheduled interview rounds</p>
            </div>
            <button
              type="button"
              className="btn-text-action"
              onClick={() => onNavigate('followups')}
            >
              <span>View all</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="actions-list">
            {urgentActions.length === 0 ? (
              <div className="panel-empty-notice">
                <CheckCircle size={18} className="empty-notice-icon" />
                <span>No overdue or upcoming deadlines this week.</span>
              </div>
            ) : (
              urgentActions.map((app) => {
                const dueLabel = app.nextFollowUp
                  ? getDueStatusLabel(app.nextFollowUp)
                  : null

                return (
                  <div key={app.id} className="action-item-row">
                    <div className="action-text-col">
                      <div className="action-company-row">
                        <strong className="action-company">{app.company}</strong>
                        <span className="action-role">· {app.role}</span>
                      </div>
                      <p className="action-note">
                        {app.interviewDate
                          ? `Interview: ${app.interviewNotes || 'Scheduled round'}`
                          : app.nextFollowUpNote || 'Follow up with recruiter'}
                      </p>
                    </div>

                    <div className="action-badge-col">
                      {app.interviewDate ? (
                        <Badge variant="interview">
                          {app.interviewDate.slice(0, 10)}
                        </Badge>
                      ) : dueLabel ? (
                        <Badge
                          variant={dueLabel.includes('Overdue') ? 'rejected' : 'interview'}
                        >
                          {dueLabel}
                        </Badge>
                      ) : null}
                      {app.nextFollowUp && !app.interviewDate && (
                        <button
                          type="button"
                          className="action-complete-check"
                          onClick={() => onToggleFollowUp(app.id)}
                          title="Mark action complete"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Applications Feed */}
        <div className="dashboard-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">Recent Submissions</h3>
              <p className="panel-subtitle">Latest opportunities added to your tracker</p>
            </div>
            <button
              type="button"
              className="btn-text-action"
              onClick={() => onNavigate('applications')}
            >
              <span>View all</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="recent-apps-list">
            {recentApplications.length === 0 ? (
              <div className="panel-empty-notice">
                <span>No applications submitted yet.</span>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="recent-app-item"
                  onClick={() => onViewDetails(app)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onViewDetails(app)
                  }}
                >
                  <span className="recent-app-avatar">
                    {app.company.charAt(0).toUpperCase()}
                  </span>
                  <div className="recent-app-info">
                    <strong className="recent-app-company">{app.company}</strong>
                    <span className="recent-app-role">{app.role}</span>
                  </div>
                  <div className="recent-app-meta">
                    <Badge variant={app.status}>{app.status}</Badge>
                    <span className="recent-app-date">
                      {formatDisplayDate(app.date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
