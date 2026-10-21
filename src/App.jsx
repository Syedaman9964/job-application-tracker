
import { useEffect, useState } from 'react'
import {
  BriefcaseBusiness, LayoutDashboard, Search, Plus, Pencil, Trash2,
  Send, CalendarCheck, Trophy, XCircle, TrendingUp, Filter,
} from 'lucide-react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import './App.css'

const STORAGE_KEY = 'jobtrack-applications'
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected']
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444']

function App() {
  const [applications, setApplications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  const editingApp = applications.find((app) => app.id === editingId)

  const openAddForm = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const details = {
      company: data.get('company').trim(),
      role: data.get('role').trim(),
      date: data.get('date'),
      status: data.get('status'),
    }

    if (editingId) {
      setApplications((prev) =>
        prev.map((app) => app.id === editingId ? { ...app, ...details } : app),
      )
    } else {
      setApplications((prev) => [
        { id: crypto.randomUUID(), ...details },
        ...prev,
      ])
    }

    setShowForm(false)
    setEditingId(null)
  }

  const deleteApplication = (id) => {
    if (window.confirm('Delete this application?')) {
      setApplications((prev) => prev.filter((app) => app.id !== id))
    }
  }

  const counts = Object.fromEntries(
    STATUSES.map((status) => [
      status,
      applications.filter((app) => app.status === status).length,
    ]),
  )

  const filteredApplications = applications.filter((app) => {
    const query = search.toLowerCase()
    const matchesSearch =
      app.company.toLowerCase().includes(query) ||
      app.role.toLowerCase().includes(query)
    return matchesSearch && (filterStatus === 'All' || app.status === filterStatus)
  })

  const chartData = STATUSES
    .map((status) => ({ name: status, value: counts[status] }))
    .filter((item) => item.value > 0)

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: BriefcaseBusiness, tone: 'purple' },
    { label: 'Interviews', value: counts.Interview, icon: CalendarCheck, tone: 'orange' },
    { label: 'Offers', value: counts.Offer, icon: Trophy, tone: 'green' },
    { label: 'Rejected', value: counts.Rejected, icon: XCircle, tone: 'red' },
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon"><BriefcaseBusiness size={22} /></span>
          <span>JobTrack<span className="brand-dot">.</span></span>
        </div>
        <p className="sidebar-label">WORKSPACE</p>
        <div className="nav-item active"><LayoutDashboard size={18} /> Dashboard</div>
        <div className="nav-item"><BriefcaseBusiness size={18} /> My Applications</div>
        <div className="sidebar-note">
          <TrendingUp size={20} />
          <strong>Keep moving forward</strong>
          <p>Every application is a step toward your next opportunity.</p>
        </div>
        <div className="sidebar-footer">JOB SEARCH ORGANIZER</div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <p className="eyebrow">YOUR CAREER JOURNEY</p>
            <h1>Dashboard</h1>
            <p className="header-subtitle">Stay organised. Track progress. Land your next role.</p>
          </div>
          <button className="primary-button" onClick={openAddForm}>
            <Plus size={18} /> Add Application
          </button>
        </header>

        <section className="stats">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div className="stat-card stat-modern" key={label}>
              <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
              <p>{label}</p>
              <h2>{value}</h2>
              <span className="stat-caption">Tracked applications</span>
            </div>
          ))}
        </section>

        <section className="analytics-grid">
          <div className="panel chart-panel">
            <div className="panel-heading">
              <div><h2>Application Overview</h2><p>Breakdown by current status</p></div>
            </div>
            {chartData.length === 0 ? (
              <div className="chart-empty">Add an application to see your progress chart.</div>
            ) : (
              <div className="chart-content">
                <div className="pie-wrap">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" innerRadius={57} outerRadius={84}
                        paddingAngle={4}>
                        {chartData.map((item) => (
                          <Cell key={item.name} fill={COLORS[STATUSES.indexOf(item.name)]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-center">
                    <strong>{applications.length}</strong><span>Total</span>
                  </div>
                </div>
                <div className="chart-legend">
                  {STATUSES.map((status, index) => (
                    <div className="legend-row" key={status}>
                      <span className="legend-dot" style={{ background: COLORS[index] }} />
                      <span>{status}</span><strong>{counts[status]}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="panel chart-panel">
            <div className="panel-heading">
              <div><h2>Status Summary</h2><p>Applications by stage</p></div>
            </div>
            <div className="bar-chart">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={STATUSES.map((status) => ({ status, total: counts[status] }))} margin={{ top: 12, right: 4, left: -24, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f6" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Applications" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="panel applications-panel">
          <div className="applications-heading">
            <div><h2>My Applications</h2><p>Manage and track your job opportunities</p></div>
            <span className="total-pill">{applications.length} total</span>
          </div>

          <div className="application-tools">
            <div className="search-box">
              <Search size={18} />
              <input type="search" placeholder="Search company or role..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="filter-box">
              <Filter size={17} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All statuses</option>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>

          {showForm && (
            <form key={editingId || 'new'} className="application-form" onSubmit={handleSubmit}>
              <div className="form-title">
                <h3>{editingApp ? 'Edit Application' : 'New Application'}</h3>
                <button className="icon-button" type="button" onClick={() => { setShowForm(false); setEditingId(null) }} aria-label="Close form"><XCircle size={19} /></button>
              </div>
              <div className="form-grid">
                <label>Company Name
                  <input name="company" placeholder="e.g. Infosys" defaultValue={editingApp?.company || ''} required />
                </label>
                <label>Job Role
                  <input name="role" placeholder="e.g. Software Engineer" defaultValue={editingApp?.role || ''} required />
                </label>
                <label>Application Date
                  <input name="date" type="date" defaultValue={editingApp?.date || new Date().toISOString().slice(0, 10)} required />
                </label>
                <label>Status
                  <select name="status" defaultValue={editingApp?.status || 'Applied'}>
                    {STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              </div>
              <div className="form-actions">
                <button className="primary-button" type="submit">{editingApp ? 'Update Application' : 'Save Application'}</button>
                <button className="secondary-button" type="button" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</button>
              </div>
            </form>
          )}

          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Send size={25} /></div>
              <h3>{applications.length === 0 ? 'Your next opportunity starts here' : 'No matching applications'}</h3>
              <p>{applications.length === 0 ? 'Add your first application to start tracking your job search.' : 'Try changing your search or filter.'}</p>
              {applications.length === 0 && <button className="primary-button" onClick={openAddForm}><Plus size={17} /> Add your first application</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="applications-table">
                <thead><tr><th>COMPANY & ROLE</th><th>DATE APPLIED</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td><div className="company-cell"><span className="company-avatar">{app.company.charAt(0).toUpperCase()}</span><span><strong>{app.company}</strong><small>{app.role}</small></span></div></td>
                      <td>{app.date}</td>
                      <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                      <td><div className="row-actions">
                        <button className="icon-button edit-action" onClick={() => { setEditingId(app.id); setShowForm(true) }} aria-label="Edit application"><Pencil size={16} /></button>
                        <button className="icon-button delete-action" onClick={() => deleteApplication(app.id)} aria-label="Delete application"><Trash2 size={16} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="page-footer">Built with React · JobTrack © {new Date().getFullYear()}</footer>
      </main>
    </div>
  )
}

export default App
