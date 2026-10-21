
import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'jobtrack-applications'

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

  const openAddForm = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const application = {
      company: formData.get('company').trim(),
      role: formData.get('role').trim(),
      date: formData.get('date'),
      status: formData.get('status'),
    }

    if (editingId !== null) {
      setApplications((previous) =>
        previous.map((app) =>
          app.id === editingId ? { ...app, ...application } : app,
        ),
      )
    } else {
      setApplications((previous) => [
        { id: crypto.randomUUID(), ...application },
        ...previous,
      ])
    }

    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (app) => {
    setEditingId(app.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this application?')) {
      setApplications((previous) => previous.filter((app) => app.id !== id))
    }
  }

  const interviews = applications.filter((app) => app.status === 'Interview').length
  const offers = applications.filter((app) => app.status === 'Offer').length
  const rejected = applications.filter((app) => app.status === 'Rejected').length

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      filterStatus === 'All' || app.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const editingApp = applications.find((app) => app.id === editingId)

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>JobTrack</h2>
        <p className="active">Dashboard</p>
        <p>My Applications</p>
        <p>Interviews</p>
        <p>Settings</p>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Dashboard</h1>
            <p>Track your job search in one place.</p>
          </div>
          <button onClick={openAddForm}>+ Add Application</button>
        </header>

        <section className="stats">
          <div className="stat-card">
            <p>Total Applications</p>
            <h2>{applications.length}</h2>
          </div>
          <div className="stat-card">
            <p>Interviews</p>
            <h2>{interviews}</h2>
          </div>
          <div className="stat-card">
            <p>Offers</p>
            <h2>{offers}</h2>
          </div>
          <div className="stat-card">
            <p>Rejected</p>
            <h2>{rejected}</h2>
          </div>
        </section>

        <section className="applications">
          <h2>My Applications</h2>

          <div className="application-tools">
            <input
              type="search"
              placeholder="Search company or job role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>

          {showForm && (
            <form
              key={editingId ?? 'new'}
              className="application-form"
              onSubmit={handleSubmit}
            >
              <h3>{editingApp ? 'Edit Application' : 'Add New Application'}</h3>

              <label>
                Company Name
                <input
                  name="company"
                  placeholder="e.g. Infosys"
                  defaultValue={editingApp?.company || ''}
                  required
                />
              </label>

              <label>
                Job Role
                <input
                  name="role"
                  placeholder="e.g. Software Engineer"
                  defaultValue={editingApp?.role || ''}
                  required
                />
              </label>

              <label>
                Application Date
                <input
                  name="date"
                  type="date"
                  defaultValue={editingApp?.date || new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>

              <label>
                Status
                <select name="status" defaultValue={editingApp?.status || 'Applied'}>
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </label>

              <div className="form-actions">
                <button type="submit">
                  {editingApp ? 'Update Application' : 'Save Application'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <h3>
                {applications.length === 0
                  ? 'No applications yet'
                  : 'No matching applications'}
              </h3>
              <p>
                {applications.length === 0
                  ? 'Add your first job application to get started.'
                  : 'Try another search term or status filter.'}
              </p>
              {applications.length === 0 && (
                <button onClick={openAddForm}>+ Add your first application</button>
              )}
            </div>
          ) : (
            <div className="application-list">
              {filteredApplications.map((app) => (
                <div className="stat-card application-item" key={app.id}>
                  <div>
                    <h3>{app.company}</h3>
                    <p>{app.role}</p>
                    <p>Applied: {app.date}</p>
                    <p>Status: <strong>{app.status}</strong></p>
                  </div>
                  <div className="form-actions">
                    <button onClick={() => handleEdit(app)}>Edit</button>
                    <button onClick={() => handleDelete(app.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
