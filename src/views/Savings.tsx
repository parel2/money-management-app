import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, PlusCircle, ArrowDownCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatCompact } from '../lib/math';
import { formatTimestamp, hoursSince } from '../lib/dates';
import { Saving } from '../db';

export function Savings() {
  const { savings, openModal, withdrawSaving, savingsOverdue } = useApp();
  const [withdrawTarget, setWithdrawTarget] = useState<Saving | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const { investmentList, emergencyList, totalInvestment, totalEmergency } = useMemo(() => {
    const inv = savings.filter((s) => s.category === 'investment');
    const eme = savings.filter((s) => s.category === 'emergency');
    return {
      investmentList: inv,
      emergencyList: eme,
      totalInvestment: inv.reduce((s, sv) => s + sv.amount, 0),
      totalEmergency: eme.reduce((s, sv) => s + sv.amount, 0),
    };
  }, [savings]);

  const recentInvestment = savings.some((s) => s.category === 'investment' && hoursSince(s.date) < 24);
  const recentEmergency = savings.some((s) => s.category === 'emergency' && hoursSince(s.date) < 24);

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await withdrawSaving(withdrawTarget.id!, withdrawTarget.amount);
      setWithdrawTarget(null);
    } finally {
      setWithdrawing(false);
    }
  };

  const SavingRow = ({ sv }: { sv: Saving }) => (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        ${sv.category === 'investment' ? 'bg-brand-500/15' : 'bg-green-500/15'}`}>
        {sv.category === 'investment'
          ? <TrendingUp size={14} className="text-brand-400" />
          : <Shield size={14} className="text-green-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white capitalize">{sv.category}</p>
        <p className="text-xs text-gray-500">{formatTimestamp(sv.date)}</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold font-mono text-white">{formatCompact(sv.amount)}</p>
        <button
          onClick={() => setWithdrawTarget(sv)}
          className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all"
        >
          <ArrowDownCircle size={13} className="text-red-400" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-24"
    >
      {/* Status Banner */}
      {savingsOverdue ? (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Savings Overdue</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              You must save within every 24 hours. Special expenses are locked until you save.
            </p>
          </div>
        </div>
      ) : savings.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/25 rounded-2xl">
          <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-400">You're on track with your savings!</p>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`relative overflow-hidden rounded-2xl border p-4
          ${recentInvestment ? 'border-brand-500/40 bg-brand-500/10' : 'border-white/10 bg-surface-800'}`}>
          <TrendingUp size={18} className="text-brand-400 mb-3" />
          <p className="text-2xl font-bold text-white font-mono">{formatCompact(totalInvestment)}</p>
          <p className="text-xs text-gray-500 mt-1">Investment</p>
          {recentInvestment && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] bg-brand-500/25 border border-brand-500/40 text-brand-300 px-1.5 py-0.5 rounded-full">Active</span>
            </div>
          )}
        </div>
        <div className={`relative overflow-hidden rounded-2xl border p-4
          ${recentEmergency ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 bg-surface-800'}`}>
          <Shield size={18} className="text-green-400 mb-3" />
          <p className="text-2xl font-bold text-white font-mono">{formatCompact(totalEmergency)}</p>
          <p className="text-xs text-gray-500 mt-1">Emergency</p>
          {recentEmergency && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] bg-green-500/25 border border-green-500/40 text-green-300 px-1.5 py-0.5 rounded-full">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Required checklist */}
      <Card className="p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">24-Hour Requirements</p>
        <div className="space-y-2">
          {[
            { label: 'Investment (min Rp 10,000)', done: recentInvestment },
            { label: 'Emergency Fund (min Rp 5,000)', done: recentEmergency },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                ${done ? 'bg-green-500/20 border border-green-500/40' : 'bg-white/5 border border-white/15'}`}>
                {done && <CheckCircle size={12} className="text-green-400" />}
              </div>
              <span className={`text-sm ${done ? 'text-green-300 line-through decoration-green-500/50' : 'text-gray-300'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={() => openModal('add_saving')}
          icon={<PlusCircle size={15} />}
        >
          Add Saving
        </Button>
      </Card>

      {/* Investment History */}
      {investmentList.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Investment History</p>
          <Card className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {investmentList.map((sv) => <SavingRow key={sv.id} sv={sv} />)}
            </div>
          </Card>
        </div>
      )}

      {/* Emergency History */}
      {emergencyList.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Emergency Fund History</p>
          <Card className="overflow-hidden">
            <div className="divide-y divide-white/5">
              {emergencyList.map((sv) => <SavingRow key={sv.id} sv={sv} />)}
            </div>
          </Card>
        </div>
      )}

      {savings.length === 0 && (
        <Card className="p-10 text-center">
          <Shield size={28} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">No savings yet</p>
          <p className="text-xs text-gray-600 mt-1">Start saving to build your financial safety net.</p>
        </Card>
      )}

      {/* Withdraw Confirm Modal */}
      <Modal
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        title="Confirm Withdrawal"
        size="sm"
      >
        {withdrawTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Withdraw <span className="font-bold text-white font-mono">{formatCurrency(withdrawTarget.amount)}</span> from{' '}
              <span className="capitalize text-white">{withdrawTarget.category}</span> savings?
            </p>
            <p className="text-xs text-amber-400">This amount will be moved back to your current balance.</p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setWithdrawTarget(null)}>Cancel</Button>
              <Button variant="danger" fullWidth loading={withdrawing} onClick={handleWithdraw}>
                Withdraw
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
