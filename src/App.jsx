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
import AdminAuthGate from './components/auth/AdminAuthGate.jsx'
import CloudMigrationModal from './components/data/CloudMigrationModal.jsx'

import {
  loadApplications,
  saveApplications,
  loadSettings,
  saveSettings,
  normalizeApplication,
  getSampleApplications,
} from './utils/storage.js'
import {
  supabase,
  isSupabaseConfigured,
  fetchCloudApplications,
  insertCloudApplication,
  updateCloudApplication,
  deleteCloudApplication,
  signOutAdmin,
  TARGET_ADMIN_EMAIL,
} from './utils/supabaseClient.js'
import { sendAdminNotification } from './utils/notifications.js'
import './App.css'

function JobTrackApp() {
  // Local storage copy (for fallback and migration)
  const localApps = loadApplications()

  // Primary applications state
  const [applications, setApplications] = useState(() => localApps)
  const [settings, setSettings] = useState(() => loadSettings())
  const [currentView, setCurrentView] = useState(() => settings.defaultView || 'dashboard')

  // Auth & Cloud state
  const [currentUser, setCurrentUser] = useState(null)
  const [isCloudSyncing, setIsCloudSyncing] = useState(false)
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false)

  // Modals & Dialogs state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [formInitialData, setFormInitialData] = useState(null)
  const [detailApp, setDetailApp] = useState(null)
  const [deleteCandidateId, setDeleteCandidateId] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Toast feedback state
  const [toast, setToast] = useState(null)

  // Show auto-dismiss toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    const timer = setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr))
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  // Sync settings to localStorage
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // If using local storage mode, keep localStorage in sync
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      saveApplications(applications)
    }
  }, [applications])

  // Fetch from Supabase when cloud mode is active
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return

    let isMounted = true

    async function loadCloudData() {
      setIsCloudSyncing(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return

      if (user) {
        setCurrentUser(user)
        const { data, error } = await fetchCloudApplications()
        if (isMounted) {
          if (!error && data) {
            setApplications(data)
            // If cloud has 0 records but local storage has records, invite user to migrate
            if (data.length === 0 && localApps.length > 0) {
              setIsMigrationModalOpen(true)
            }
          } else if (error) {
            console.error('Failed to load cloud applications:', error)
            showToast('Could not fetch cloud applications. Check database permissions.', 'error')
          }
          setIsCloudSyncing(false)
        }
      } else {
        setIsCloudSyncing(false)
      }
    }

    loadCloudData()

    return () => {
      isMounted = false
    }
  }, [localApps.length, showToast])

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
  const handleSaveApplication = async (formData) => {
    const isEditing = Boolean(formData.id)
    const nowISO = new Date().toISOString()

    if (isEditing) {
      const updatedLocal = normalizeApplication({ ...formData, updatedAt: nowISO })

      // Update state optimistically
      setApplications((prev) =>
        prev.map((item) => (item.id === formData.id ? updatedLocal : item)),
      )
      if (detailApp?.id === formData.id) {
        setDetailApp(updatedLocal)
      }

      // Persist to cloud if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          await updateCloudApplication(formData.id, updatedLocal)
        } catch (err) {
          console.error('Failed to update cloud application:', err)
          showToast('Failed to save update to cloud database', 'error')
          return
        }
      }

      showToast(`Updated application for ${formData.company}`)
      // Trigger non-blocking email alert
      sendAdminNotification('update', updatedLocal)
    } else {
      let newRecord = normalizeApplication({
        ...formData,
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        createdAt: nowISO,
        updatedAt: nowISO,
      })

      // Persist to cloud if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          const inserted = await insertCloudApplication(newRecord, currentUser?.id)
          newRecord = inserted
        } catch (err) {
          console.error('Failed to insert cloud application:', err)
          showToast('Failed to save application to cloud database', 'error')
          return
        }
      }

      setApplications((prev) => [newRecord, ...prev])
      showToast(`Added application for ${formData.company}`)
      // Trigger non-blocking email alert
      sendAdminNotification('create', newRecord)
    }
  }

  // Quick Stage change (from Table, Board, or Detail Modal)
  const handleStatusChange = async (appId, newStatus) => {
    const target = applications.find((a) => a.id === appId)
    const updated = { ...(target || {}), status: newStatus, updatedAt: new Date().toISOString() }

    // Update state optimistically
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? updated : app)),
    )
    if (detailApp?.id === appId) {
      setDetailApp(updated)
    }

    // Persist to cloud if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await updateCloudApplication(appId, { status: newStatus })
      } catch (err) {
        console.error('Failed to update status in cloud:', err)
        showToast('Failed to sync stage change with cloud database', 'error')
        return
      }
    }

    const name = target ? target.company : 'Application'
    showToast(`Moved ${name} to ${newStatus}`)
    // Trigger non-blocking email alert
    sendAdminNotification('status_change', updated)
  }

  // Toggle follow-up complete status
  const handleToggleFollowUp = async (appId) => {
    const target = applications.find((a) => a.id === appId)
    if (!target) return
    const updatedDone = !target.nextFollowUpDone
    const updated = {
      ...target,
      nextFollowUpDone: updatedDone,
      updatedAt: new Date().toISOString(),
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? updated : app)),
    )
    if (detailApp?.id === appId) {
      setDetailApp(updated)
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await updateCloudApplication(appId, { nextFollowUpDone: updatedDone })
      } catch (err) {
        console.error('Failed to sync follow-up status:', err)
      }
    }

    showToast('Updated task status')
  }

  // Request deletion confirmation
  const handleRequestDelete = (appId) => {
    setDeleteCandidateId(appId)
  }

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteCandidateId) return
    const target = applications.find((a) => a.id === deleteCandidateId)

    // Remove from state optimistically
    setApplications((prev) => prev.filter((a) => a.id !== deleteCandidateId))
    if (detailApp?.id === deleteCandidateId) {
      setDetailApp(null)
    }

    // Delete from cloud if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await deleteCloudApplication(deleteCandidateId)
      } catch (err) {
        console.error('Failed to delete cloud application:', err)
        showToast('Failed to delete application from cloud database', 'error')
        return
      }
    }

    const deletedApp = target
    setDeleteCandidateId(null)
    showToast(`Deleted ${deletedApp ? deletedApp.company : 'application'}`)
    // Trigger non-blocking email alert
    if (deletedApp) {
      sendAdminNotification('delete', deletedApp)
    }
  }

  // Load Curated Sample Data
  const handleLoadSampleData = () => {
    const samples = getSampleApplications()
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

  // Handle migration completed from local to cloud
  const handleMigrationComplete = (migratedApps) => {
    setApplications(migratedApps)
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
      subtitle: 'Local-first client storage, cloud PostgreSQL, and CSV export tools.',
    },
    settings: {
      title: 'Settings & Security',
      subtitle: 'Preferences, weekly targets, administrator security, and about.',
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
        adminEmail={TARGET_ADMIN_EMAIL}
        onSignOut={isSupabaseConfigured() ? signOutAdmin : null}
      />

      {/* Main Content Area */}
      <main className="app-main">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenAddModal={() => handleOpenAddModal()}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          isCloudMode={isSupabaseConfigured()}
          isSyncing={isCloudSyncing}
          adminEmail={TARGET_ADMIN_EMAIL}
          onSignOut={isSupabaseConfigured() ? signOutAdmin : null}
        />

        {/* Local Storage Migration Banner (shown when Supabase is active but local records exist) */}
        {isSupabaseConfigured() && localApps.length > 0 && applications.length === 0 && (
          <div className="migration-prompt-banner">
            <div>
              <strong>Found {localApps.length} applications in this browser.</strong>
              <span> Transfer them to your secure PostgreSQL database with Row Level Security.</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsMigrationModalOpen(true)}
            >
              Start Safe Migration
            </button>
          </div>
        )}

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
              onOpenMigrationModal={() => setIsMigrationModalOpen(true)}
              isCloudConfigured={isSupabaseConfigured()}
              localRecordCount={localApps.length}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
              onLoadSampleData={handleLoadSampleData}
              onShowToast={showToast}
              adminEmail={TARGET_ADMIN_EMAIL}
              isCloudConfigured={isSupabaseConfigured()}
              onSignOut={isSupabaseConfigured() ? signOutAdmin : null}
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
        message="Are you sure you want to remove this application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep"
        isDestructive={true}
      />

      {/* Cloud Migration Wizard Modal */}
      <CloudMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        localApplications={localApps}
        userId={currentUser?.id}
        onMigrationComplete={handleMigrationComplete}
        onShowToast={showToast}
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

export default function App() {
  return (
    <AdminAuthGate>
      <JobTrackApp />
    </AdminAuthGate>
  )
}
