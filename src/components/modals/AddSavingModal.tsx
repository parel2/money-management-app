import React, { useState } from 'react';
import { Shield, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function AddSavingModal() {
  const { activeModal, closeModal, addSaving } = useApp();
  const [category, setCategory] = useState<'investment' | 'emergency'>('investment');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const isOpen = activeModal === 'add_saving';

  const min = category === 'investment' ? 10000 : 5000;

  const handleClose = () => {
    closeModal();
    setAmount('');
    setCategory('investment');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val) return;
    setLoading(true);
    try {
      await addSaving(category, val);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title="Add Saving">
      <div className="space-y-5">
        {/* Category selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setCategory('investment')}
            className={`p-4 rounded-xl border text-left transition-all
              ${category === 'investment'
                ? 'border-brand-500/60 bg-brand-500/10'
                : 'border-white/10 bg-surface-700 hover:border-white/20'}`}
          >
            <TrendingUp size={20} className={category === 'investment' ? 'text-brand-400' : 'text-gray-500'} />
            <p className="mt-2 font-semibold text-sm text-white">Investment</p>
            <p className="text-xs text-gray-500 mt-0.5">Min Rp 10,000</p>
          </button>
          <button
            onClick={() => setCategory('emergency')}
            className={`p-4 rounded-xl border text-left transition-all
              ${category === 'emergency'
                ? 'border-green-500/60 bg-green-500/10'
                : 'border-white/10 bg-surface-700 hover:border-white/20'}`}
          >
            <Shield size={20} className={category === 'emergency' ? 'text-green-400' : 'text-gray-500'} />
            <p className="mt-2 font-semibold text-sm text-white">Emergency</p>
            <p className="text-xs text-gray-500 mt-0.5">Min Rp 5,000</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono pointer-events-none">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={min.toLocaleString('id-ID')}
                min={min}
                required
                autoFocus
                className="w-full bg-surface-700 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-semibold font-mono placeholder-gray-700
                  focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum: Rp {min.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {[min, min * 2, min * 5, min * 10].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="py-2 rounded-lg text-xs font-medium bg-surface-700 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                {v >= 1000 ? `${v / 1000}K` : v}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            variant={category === 'investment' ? 'primary' : 'success'}
            size="lg"
            fullWidth
            loading={loading}
          >
            Save Now
          </Button>
        </form>
      </div>
    </Modal>
  );
}

