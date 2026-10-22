import { useState, useRef } from 'react'
import {
  Download,
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  HardDrive,
  Trash2,
  CloudUpload,
} from 'lucide-react'
import {
  getStorageUsage,
  generateCSV,
  downloadFile,
  parseImportJSON,
} from '../../utils/storage.js'
import { getTodayDateString } from '../../utils/date.js'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import Modal from '../common/Modal.jsx'

export default function DataSafetyHub({
  applications,
  onImportApplications,
  onClearAllData,
  onShowToast,
  onOpenMigrationModal,
  isCloudConfigured = false,
  localRecordCount = 0,
}) {
  const fileInputRef = useRef(null)
  const usage = getStorageUsage()
  const todayStr = getTodayDateString()

  // Import preview modal state
  const [importCandidate, setImportCandidate] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Clear data confirm dialog state
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

  // Trigger JSON download
  const handleExportJSON = () => {
    if (applications.length === 0) {
      onShowToast('No applications to export yet.', 'info')
      return
    }

    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      appName: 'JobTrack',
      count: applications.length,
      data: applications,
    }

    const content = JSON.stringify(payload, null, 2)
    const fileName = `jobtrack-backup-${todayStr}.json`
    downloadFile(content, fileName, 'application/json')
    onShowToast(`Exported ${applications.length} applications to ${fileName}`, 'success')
  }

  // Trigger CSV download
  const handleExportCSV = () => {
    if (applications.length === 0) {
      onShowToast('No applications to export yet.', 'info')
      return
    }

    const csvContent = generateCSV(applications)
    const fileName = `jobtrack-applications-${todayStr}.csv`
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;')
    onShowToast(`Exported ${applications.length} applications to CSV`, 'success')
  }

  // Handle uploaded JSON file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text !== 'string') return

      const result = parseImportJSON(text)
      if (!result.valid) {
        onShowToast(result.error || 'Failed to parse JSON file.', 'error')
        return
      }

      setImportCandidate(result.applications)
      setIsImportModalOpen(true)
    }

    reader.onerror = () => {
      onShowToast('Failed to read file from disk.', 'error')
    }

    reader.readAsText(file)
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmImport = (mode) => {
    if (!importCandidate || importCandidate.length === 0) return
    onImportApplications(importCandidate, mode)
    setIsImportModalOpen(false)
    setImportCandidate(null)
    onShowToast(
      mode === 'replace'
        ? `Replaced records with ${importCandidate.length} imported applications.`
        : `Merged ${importCandidate.length} applications into your tracker.`,
      'success',
    )
  }

  return (
    <div className="data-safety-container">
      {/* Privacy Callout */}
      <div className="privacy-banner-card">
        <div className="privacy-banner-icon">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3 className="privacy-banner-title">
            100% Client-Side Privacy Guarantee
          </h3>
          <p className="privacy-banner-desc">
            JobTrack saves all your records directly into your browser&apos;s local storage. None of your target companies, salaries, interview schedules, or notes are ever transmitted to any third-party server or cloud database.
          </p>
        </div>
      </div>

      {/* Cloud Migration Card */}
      {isCloudConfigured && (
        <div className="data-card highlight-card">
          <div className="data-card-header">
            <div className="card-header-icon highlight">
              <CloudUpload size={18} />
            </div>
            <div>
              <h3 className="card-title">Cloud Database & Safe Migration</h3>
              <p className="card-subtitle">
                PostgreSQL with Row Level Security is active and connected
              </p>
            </div>
          </div>
          <div className="cloud-sync-body">
            <p>
              Your cloud database allows private cross-device access to your applications.
              {localRecordCount > 0 ? (
                <> You have <strong>{localRecordCount}</strong> records in browser storage available to migrate.</>
              ) : (
                <> All records are securely synchronized with PostgreSQL RLS.</>
              )}
            </p>
            {localRecordCount > 0 && onOpenMigrationModal && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenMigrationModal}
              >
                <CloudUpload size={16} />
                <span>Launch Migration Wizard ({localRecordCount} local records)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Storage Quota Card */}
      <div className="data-card">
        <div className="data-card-header">
          <div className="card-header-icon">
            <HardDrive size={18} />
          </div>
          <div>
            <h3 className="card-title">Browser Storage Utilization</h3>
            <p className="card-subtitle">
              Approximate space consumed by your tracked applications
            </p>
          </div>
        </div>
        <div className="storage-meter-wrap">
          <div className="storage-meter-bar">
            <div
              className="storage-meter-fill"
              style={{
                width: `${Math.max(1, (usage.kbUsed / usage.limitKb) * 100)}%`,
              }}
            />
          </div>
          <div className="storage-meter-labels">
            <span>{usage.kbUsed} KB used</span>
            <span>~{usage.limitKb / 1024} MB standard browser quota</span>
          </div>
        </div>
      </div>

      {/* Export / Import Section */}
      <div className="data-grid-two">
        {/* Backup and Export Card */}
        <div className="data-card">
          <div className="data-card-header">
            <div className="card-header-icon">
              <Download size={18} />
            </div>
            <div>
              <h3 className="card-title">Export & Backup</h3>
              <p className="card-subtitle">
                Download your data for safekeeping or spreadsheet analysis
              </p>
            </div>
          </div>
          <div className="data-card-actions">
            <button
              type="button"
              className="btn btn-secondary data-action-btn"
              onClick={handleExportJSON}
            >
              <Download size={16} />
              <div>
                <strong>Download JSON Backup</strong>
                <small>Full application dataset for restoring anytime</small>
              </div>
            </button>

            <button
              type="button"
              className="btn btn-secondary data-action-btn"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet size={16} />
              <div>
                <strong>Export RFC-4180 CSV</strong>
                <small>Formatted for Microsoft Excel & Google Sheets</small>
              </div>
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="data-card">
          <div className="data-card-header">
            <div className="card-header-icon">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="card-title">Restore from Backup</h3>
              <p className="card-subtitle">
                Import applications from a previously saved JSON file
              </p>
            </div>
          </div>
          <div className="data-card-actions">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn btn-primary data-action-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <div>
                <strong>Select JSON Backup File</strong>
                <small>Validates schema and confirms before overwriting</small>
              </div>
            </button>
            <p className="restore-helper-note">
              Compatible with all versions of JobTrack JSON exports.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="data-card danger-zone">
        <div className="data-card-header">
          <div className="card-header-icon danger">
            <Trash2 size={18} />
          </div>
          <div>
            <h3 className="card-title danger-title">Danger Zone</h3>
            <p className="card-subtitle">
              Irreversibly delete all applications stored in this browser
            </p>
          </div>
        </div>
        <div className="danger-zone-footer">
          <p className="danger-zone-warning">
            This will permanently erase all {applications.length} tracked records from your browser&apos;s localStorage. Please export a JSON backup first if you might need this data later.
          </p>
          <button
            type="button"
            className="btn btn-danger"
            disabled={applications.length === 0}
            onClick={() => setIsClearConfirmOpen(true)}
          >
            <Trash2 size={15} />
            <span>Clear All Applications</span>
          </button>
        </div>
      </div>

      {/* Import Decision Modal */}
      {isImportModalOpen && importCandidate && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false)
            setImportCandidate(null)
          }}
          title="Restore Applications"
          subtitle={`Found ${importCandidate.length} valid application records in this file.`}
          maxWidth="500px"
        >
          <div className="import-decision-body">
            <p>How would you like to apply these records to your current tracker?</p>
            <div className="import-options-stack">
              <button
                type="button"
                className="import-option-card"
                onClick={() => handleConfirmImport('merge')}
              >
                <strong>Merge with existing data</strong>
                <span>
                  Keeps your current {applications.length} applications and appends the {importCandidate.length} imported records (preventing duplicates).
                </span>
              </button>

              <button
                type="button"
                className="import-option-card replace"
                onClick={() => handleConfirmImport('replace')}
              >
                <strong>Replace all existing data</strong>
                <span>
                  Replaces your current list entirely with the {importCandidate.length} imported records.
                </span>
              </button>
            </div>
            <div className="import-cancel-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsImportModalOpen(false)
                  setImportCandidate(null)
                }}
              >
                Cancel Import
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Clear All Data Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={() => {
          onClearAllData()
          onShowToast('All applications cleared from local storage.', 'info')
        }}
        title="Delete All Applications?"
        message={`Are you absolutely sure you want to delete all ${applications.length} applications? This action cannot be undone.`}
        confirmText="Yes, Delete Everything"
        cancelText="Keep My Data"
        isDestructive={true}
      />
    </div>
  )
}
