
import { useState } from 'react'
import './App.css'

function App() {
  const [showForm, setShowForm] = useState(false)
  const [applications, setApplications] = useState([])

  const handleSubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const application = {
      id: Date.now(),
      company: formData.get('company'),
      role: formData.get('role'),
      date: formData.get('date'),
      status: formData.get('status'),
    }

    setApplications((previous) => [...previous, application])
    event.currentTarget.reset()
    setShowForm(false)
  }

  const interviews = applications.filter(
    (app) => app.status === 'Interview',
  ).length

  const offers = applications.filter(
    (app) => app.status === 'Offer',
  ).length

  const rejected = applications.filter(
    (app) => app.status === 'Rejected',
  ).length

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

          <button onClick={() => setShowForm(true)}>
            + Add Application
          </button>
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
          <h2>Recent Applications</h2>

          {showForm && (
            <form className="application-form" onSubmit={handleSubmit}>
              <h3>Add New Application</h3>

              <label>
                Company Name
                <input
                  name="company"
                  placeholder="e.g. Infosys"
                  required
                />
              </label>

              <label>
                Job Role
                <input
                  name="role"
                  placeholder="e.g. Software Engineer"
                  required
                />
              </label>

              <label>
                Application Date
                <input name="date" type="date" required />
              </label>

              <label>
                Status
                <select name="status" defaultValue="Applied">
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </label>

              <div className="form-actions">
                <button type="submit">Save Application</button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {applications.length === 0 ? (
            <div className="empty-state">
              <h3>No applications yet</h3>
              <p>Your job applications will appear here.</p>
              <button onClick={() => setShowForm(true)}>
                + Add your first application
              </button>
            </div>
          ) : (
            <div className="application-list">
              {applications.map((app) => (
                <div className="stat-card" key={app.id}>
                  <h3>{app.company}</h3>
                  <p>{app.role}</p>
                  <p>Applied: {app.date}</p>
                  <p>Status: {app.status}</p>
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
