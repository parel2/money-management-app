import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export function DailyGatekeeper() {
  const { activeModal, submitDailyIncome, closeModal } = useApp();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = activeModal === 'daily_gatekeeper';
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!val || val <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      await submitDailyIncome(val);
      closeModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-xl" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="relative w-full max-w-sm mx-4"
      >
        {/* Ambient glow */}
        <div className="absolute -inset-4 bg-brand-500/10 rounded-3xl blur-2xl pointer-events-none" />

        <div className="relative bg-surface-800 border border-white/10 rounded-2xl shadow-glass overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-400/30">
              <Sun size={28} className="text-brand-300" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Good Day!</h1>
            <p className="text-gray-400 text-sm">Log today's income to start tracking</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-5">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
                Uang Hari Ini (Daily Income)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono pointer-events-none">
                  Rp
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  placeholder="0"
                  className="w-full bg-surface-700 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white text-xl font-semibold font-mono placeholder-gray-700
                    focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                  autoFocus
                  min="0"
                  step="1000"
                />
              </div>
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Quick select</p>
              <div className="grid grid-cols-4 gap-2">
                {[50000, 100000, 150000, 200000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={`py-2 rounded-lg text-xs font-medium transition-all border
                      ${amount === String(v)
                        ? 'bg-brand-500/30 border-brand-500/50 text-brand-300'
                        : 'bg-surface-700 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}`}
                  >
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<Wallet size={18} />}
            >
              Start My Day
            </Button>
          </form>

          {/* Stats hint */}
          <div className="border-t border-white/10 px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp size={12} />
            <span>Every day counts. Consistent tracking leads to financial clarity.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
