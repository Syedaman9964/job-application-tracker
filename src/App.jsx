import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import Header from './components/layout/Header.jsx'
import DashboardView from './components/dashboard/DashboardView.jsx'
import ApplicationsTable from './components/applications/ApplicationsTable.jsx'
import KanbanBoard from './components/kanban/KanbanBoard.jsx'
import FollowUpHub from './components/followups/FollowUpHub.jsx'
import DataSafetyHub from './components/data/DataSafetyHub.jsx'
import SettingsView from './components/settings/SettingsView.jsx'
import ApplicationFormModal from './components/applications/ApplicationFormModal.jsx'
import ApplicationDetailModal from './components/applications/ApplicationDetailModal.jsx'
import ConfirmDialog from './components/common/ConfirmDialog.jsx'
import Toast from './components/common/Toast.jsx'

import {
  loadApplications,
  saveApplications,
  loadSettings,
  saveSettings,
  normalizeApplication,
  getSampleApplications,
} from './utils/storage.js'
import './App.css'

export default function App() {
  // Load applications safely from localStorage
  const [applications, setApplications] = useState(() => loadApplications())

  // Load user settings
  const [settings, setSettings] = useState(() => loadSettings())

  // View state: 'dashboard' | 'applications' | 'kanban' | 'followups' | 'data' | 'settings'
  const [currentView, setCurrentView] = useState(() => settings.defaultView || 'dashboard')

  // Modals & Dialogs state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formInitialData, setFormInitialData] = useState(null)
  const [detailApp, setDetailApp] = useState(null)
  const [deleteCandidateId, setDeleteCandidateId] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Toast feedback state
  const [toast, setToast] = useState(null)

  // Synchronize applications to localStorage
  useEffect(() => {
    saveApplications(applications)
  }, [applications])

  // Synchronize settings to localStorage
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Show auto-dismiss toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    const timer = setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr))
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  // Open Add modal (optionally prefilled with stage)
  const handleOpenAddModal = (preset = null) => {
    setFormInitialData(preset)
    setIsFormModalOpen(true)
  }

  // Open Edit modal
  const handleOpenEditModal = (app) => {
    setFormInitialData(app)
    setIsFormModalOpen(true)
  }

  // Save Application (Add or Update)
  const handleSaveApplication = (formData) => {
    const isEditing = Boolean(formData.id)
    const nowISO = new Date().toISOString()

    if (isEditing) {
      setApplications((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? normalizeApplication({ ...item, ...formData, updatedAt: nowISO })
            : item,
        ),
      )
      // Update detail modal if open
      if (detailApp?.id === formData.id) {
        setDetailApp((curr) => ({ ...curr, ...formData, updatedAt: nowISO }))
      }
      showToast(`Updated application for ${formData.company}`)
    } else {
      const newRecord = normalizeApplication({
        ...formData,
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        createdAt: nowISO,
        updatedAt: nowISO,
      })
      setApplications((prev) => [newRecord, ...prev])
      showToast(`Added application for ${formData.company}`)
    }
  }

  // Quick Stage change (from Table, Board, or Detail Modal)
  const handleStatusChange = (appId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app,
      ),
    )
    if (detailApp?.id === appId) {
      setDetailApp((curr) => ({ ...curr, status: newStatus }))
    }
    const target = applications.find((a) => a.id === appId)
    const name = target ? target.company : 'Application'
    showToast(`Moved ${name} to ${newStatus}`)
  }

  // Toggle follow-up complete status
  const handleToggleFollowUp = (appId) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app
        const updatedDone = !app.nextFollowUpDone
        return {
          ...app,
          nextFollowUpDone: updatedDone,
          updatedAt: new Date().toISOString(),
        }
      }),
    )
    if (detailApp?.id === appId) {
      setDetailApp((curr) => ({ ...curr, nextFollowUpDone: !curr.nextFollowUpDone }))
    }
    showToast('Updated task status')
  }

  // Request deletion confirmation
  const handleRequestDelete = (appId) => {
    setDeleteCandidateId(appId)
  }

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteCandidateId) return
    const target = applications.find((a) => a.id === deleteCandidateId)
    setApplications((prev) => prev.filter((a) => a.id !== deleteCandidateId))
    if (detailApp?.id === deleteCandidateId) {
      setDetailApp(null)
    }
    setDeleteCandidateId(null)
    showToast(`Deleted ${target ? target.company : 'application'}`)
  }

  // Load Curated Sample Data
  const handleLoadSampleData = () => {
    const samples = getSampleApplications()
    // Append or replace
    setApplications((prev) => {
      const existingIds = new Set(prev.map((a) => a.company.toLowerCase()))
      const nonDuplicates = samples.filter((s) => !existingIds.has(s.company.toLowerCase()))
      return [...nonDuplicates, ...prev]
    })
    showToast('Loaded 5 sample applications into your pipeline')
  }

  // Import from JSON (merge or replace)
  const handleImportApplications = (importedList, mode) => {
    if (mode === 'replace') {
      setApplications(importedList)
    } else {
      // Merge by matching company + role
      setApplications((prev) => {
        const existingKeys = new Set(prev.map((a) => `${a.company.toLowerCase()}__${a.role.toLowerCase()}`))
        const newRecords = importedList.filter(
          (imp) => !existingKeys.has(`${imp.company.toLowerCase()}__${imp.role.toLowerCase()}`),
        )
        return [...newRecords, ...prev]
      })
    }
  }

  // Clear all data
  const handleClearAllData = () => {
    setApplications([])
    setDetailApp(null)
  }

  // Update Settings
  const handleSaveSettings = (newSettings) => {
    setSettings((curr) => ({ ...curr, ...newSettings }))
  }

  // Titles per view
  const viewTitles = {
    dashboard: {
      title: 'Career Dashboard',
      subtitle: 'Overview of your pipeline, scheduled rounds, and weekly progress.',
    },
    applications: {
      title: 'Applications Directory',
      subtitle: 'Search, filter, and manage all your career opportunities.',
    },
    kanban: {
      title: 'Pipeline Board',
      subtitle: 'Visualize stages and drag opportunities through your hiring pipeline.',
    },
    followups: {
      title: 'Follow-ups & Action Items',
      subtitle: 'Keep track of recruiter deadlines, tasks, and upcoming interview dates.',
    },
    data: {
      title: 'Data & Privacy',
      subtitle: 'Local-first client storage, JSON backups, and CSV export tools.',
    },
    settings: {
      title: 'Settings & About',
      subtitle: 'Preferences, weekly targets, and portfolio information.',
    },
  }

  const { title, subtitle } = viewTitles[currentView] || viewTitles.dashboard

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        applicationCount={applications.length}
        onOpenAddModal={() => handleOpenAddModal()}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="app-main">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenAddModal={() => handleOpenAddModal()}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <div className="app-view-body">
          {currentView === 'dashboard' && (
            <DashboardView
              applications={applications}
              weeklyGoal={settings.weeklyGoal}
              onNavigate={setCurrentView}
              onOpenAddModal={handleOpenAddModal}
              onLoadSampleData={handleLoadSampleData}
              onToggleFollowUp={handleToggleFollowUp}
              onViewDetails={setDetailApp}
            />
          )}

          {currentView === 'applications' && (
            <ApplicationsTable
              applications={applications}
              onViewDetails={setDetailApp}
              onEdit={handleOpenEditModal}
              onDelete={handleRequestDelete}
              onStatusChange={handleStatusChange}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {currentView === 'kanban' && (
            <KanbanBoard
              applications={applications}
              onStatusChange={handleStatusChange}
              onViewDetails={setDetailApp}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {currentView === 'followups' && (
            <FollowUpHub
              applications={applications}
              onToggleFollowUp={handleToggleFollowUp}
              onViewDetails={setDetailApp}
              onEdit={handleOpenEditModal}
            />
          )}

          {currentView === 'data' && (
            <DataSafetyHub
              applications={applications}
              onImportApplications={handleImportApplications}
              onClearAllData={handleClearAllData}
              onShowToast={showToast}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onLoadSampleData={handleLoadSampleData}
              onShowToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Add / Edit Application Modal */}
      {isFormModalOpen && (
        <ApplicationFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false)
            setFormInitialData(null)
          }}
          onSubmit={handleSaveApplication}
          initialData={formInitialData}
        />
      )}

      {/* Application Details Modal */}
      {detailApp && (
        <ApplicationDetailModal
          isOpen={Boolean(detailApp)}
          onClose={() => setDetailApp(null)}
          application={detailApp}
          onEdit={handleOpenEditModal}
          onDelete={handleRequestDelete}
          onStatusChange={handleStatusChange}
          onToggleFollowUp={handleToggleFollowUp}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidateId)}
        onClose={() => setDeleteCandidateId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Application"
        message="Are you sure you want to remove this application from your tracker? This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep"
        isDestructive={true}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container-fixed">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}
