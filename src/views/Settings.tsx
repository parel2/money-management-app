import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Upload, Trash2, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { exportData, importData } from '../lib/migration';
import { db } from '../db';

export function Settings() {
  const { showToast, refresh } = useApp();

  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleExport = async () => {
    try {
      const code = await exportData();
      setExportCode(code);
      setShowExport(true);
    } catch {
      showToast('Export failed.', 'error');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportCode);
    showToast('Migration code copied!', 'success');
  };

  const handleImport = async () => {
    if (!importCode.trim()) return;
    setImporting(true);
    try {
      await importData(importCode);
      showToast('Data imported successfully!', 'success');
      setShowImport(false);
      setImportCode('');
      await refresh();
      setTimeout(() => window.location.reload(), 500);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Import failed.', 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await db.transaction('rw', [db.user_state, db.transactions, db.savings], async () => {
        await db.user_state.clear();
        await db.transactions.clear();
        await db.savings.clear();
      });
      showToast('All data cleared.', 'success');
      setShowReset(false);
      setTimeout(() => window.location.reload(), 500);
    } finally {
      setResetting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-24"
    >
      {/* Data Migration */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Data Migration
        </p>
        <Card className="overflow-hidden">
          <div className="divide-y divide-white/5">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <Download size={18} className="text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Export Data</p>
                <p className="text-xs text-gray-500 mt-0.5">Generate a migration code for all your data</p>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>

            <button
              onClick={() => setShowImport(true)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                <Upload size={18} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Import Data</p>
                <p className="text-xs text-gray-500 mt-0.5">Restore from a migration code</p>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
        </Card>
      </div>

      {/* Danger Zone */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Danger Zone
        </p>
        <Card className="overflow-hidden">
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Reset All Data</p>
              <p className="text-xs text-gray-500 mt-0.5">Permanently delete all transactions and savings</p>
            </div>
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </Card>
      </div>

      {/* About */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">About</p>
        <Card className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">App</span>
            <span className="text-white font-medium">PocketVault</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Version</span>
            <span className="text-white font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Storage</span>
            <span className="text-white">Local (IndexedDB)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Privacy</span>
            <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> 100% Local</span>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      <Modal open={showExport} onClose={() => setShowExport(false)} title="Migration Code" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Copy this code and paste it in any other device to migrate your data.</p>
          <div className="relative">
            <textarea
              readOnly
              value={exportCode}
              rows={6}
              className="w-full bg-surface-900 border border-white/10 rounded-xl p-3.5 text-xs text-gray-300 font-mono resize-none focus:outline-none focus:border-brand-500"
            />
          </div>
          <Button variant="primary" fullWidth icon={<Copy size={15} />} onClick={handleCopy}>
            Copy Migration Code
          </Button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal open={showImport} onClose={() => setShowImport(false)} title="Import Data">
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-400">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            This will overwrite all existing data. Export a backup first.
          </div>
          <textarea
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Paste your migration code here..."
            rows={6}
            className="w-full bg-surface-900 border border-white/10 rounded-xl p-3.5 text-xs text-gray-300 font-mono resize-none
              focus:outline-none focus:border-brand-500 transition-all placeholder-gray-700"
          />
          <Button
            variant="primary"
            fullWidth
            icon={<Upload size={15} />}
            loading={importing}
            onClick={handleImport}
            disabled={!importCode.trim()}
          >
            Import & Restore
          </Button>
        </div>
      </Modal>

      {/* Reset Modal */}
      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset All Data" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-xl">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">This will permanently delete all your data. This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setShowReset(false)}>Cancel</Button>
            <Button variant="danger" fullWidth loading={resetting} onClick={handleReset} icon={<Trash2 size={15} />}>
              Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
