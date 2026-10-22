import { useState } from 'react'
import {
  CloudUpload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import Modal from '../common/Modal.jsx'
import { downloadFile } from '../../utils/storage.js'
import { batchInsertCloudApplications } from '../../utils/supabaseClient.js'
import { getTodayDateString } from '../../utils/date.js'

export default function CloudMigrationModal({
  isOpen,
  onClose,
  localApplications = [],
  userId,
  onMigrationComplete,
  onShowToast,
}) {
  const [step, setStep] = useState('backup') // 'backup' | 'confirm' | 'migrating' | 'success'
  const [backedUp, setBackedUp] = useState(false)
  const [migratedCount, setMigratedCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  // Step 1: Download backup before migrating
  const handleDownloadBackup = () => {
    const todayStr = getTodayDateString()
    const content = JSON.stringify(
      {
        version: 2,
        exportedAt: new Date().toISOString(),
        backupType: 'pre-cloud-migration',
        count: localApplications.length,
        data: localApplications,
      },
      null,
      2,
    )
    downloadFile(content, `jobtrack-pre-migration-backup-${todayStr}.json`, 'application/json')
    setBackedUp(true)
    onShowToast('Safety backup downloaded successfully', 'success')
  }

  // Step 2: Execute cloud migration
  const handleExecuteMigration = async () => {
    if (!backedUp) {
      setErrorMsg('Please download a safety backup before executing migration.')
      return
    }

    setStep('migrating')
    setErrorMsg('')

    try {
      const inserted = await batchInsertCloudApplications(localApplications, userId)
      setMigratedCount(inserted.length)
      setStep('success')
      onMigrationComplete(inserted)
      onShowToast(`Successfully migrated ${inserted.length} applications to your cloud database`, 'success')
    } catch (err) {
      console.error('Migration failed:', err)
      setErrorMsg(err.message || 'Database migration failed. Your local data remains safe.')
      setStep('confirm')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Migrate Local Data to Cloud Database"
      subtitle="Safely transfer your browser-stored applications to PostgreSQL with Row Level Security."
      maxWidth="580px"
    >
      <div className="migration-modal-content">
        {step === 'backup' && (
          <div className="migration-step-pane">
            <div className="migration-callout-box">
              <ShieldCheck size={22} className="callout-icon" />
              <div>
                <strong>Step 1: Download Pre-Migration Safety Backup</strong>
                <p>
                  Found <strong>{localApplications.length}</strong> applications stored locally in this browser. To ensure zero risk of accidental data loss, download a JSON backup before syncing.
                </p>
              </div>
            </div>

            <div className="backup-action-cluster">
              <button
                type="button"
                className={`btn ${backedUp ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleDownloadBackup}
              >
                <Download size={16} />
                <span>{backedUp ? 'Download Backup Again' : 'Download Safety Backup (.json)'}</span>
              </button>

              {backedUp && (
                <div className="backup-confirmed-badge">
                  <CheckCircle2 size={16} />
                  <span>Backup confirmed</span>
                </div>
              )}
            </div>

            <div className="modal-actions-right">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!backedUp}
                onClick={() => setStep('confirm')}
              >
                <span>Continue to Cloud Sync</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="migration-step-pane">
            <div className="migration-summary-card">
              <Database size={24} className="summary-icon" />
              <div>
                <h4>Ready to Import {localApplications.length} Records</h4>
                <p>
                  Records will be inserted into your Supabase PostgreSQL database under your administrator user ID with Row Level Security enabled.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="auth-alert error">
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="modal-actions-right">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep('backup')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExecuteMigration}
              >
                <CloudUpload size={16} />
                <span>Start Cloud Migration</span>
              </button>
            </div>
          </div>
        )}

        {step === 'migrating' && (
          <div className="migration-loading-pane">
            <div className="auth-spinner" />
            <p>Transferring {localApplications.length} records to secure cloud database...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="migration-success-pane">
            <div className="success-icon-wrap">
              <CheckCircle2 size={36} />
            </div>
            <h3>Cloud Migration Complete!</h3>
            <p>
              <strong>{migratedCount}</strong> applications have been committed to your PostgreSQL database. You can now access your applications seamlessly across all your devices.
            </p>
            <div className="modal-actions-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Done & Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
