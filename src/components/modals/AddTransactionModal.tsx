import React, { useState } from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

const DAILY_CATS = ['Food', 'Entertainment', 'College'];
const SPECIAL_CATS = ['Home', 'Internet/Data', 'College', 'Entertainment', 'Motorcycle', 'Style', 'Others'];

export function AddTransactionModal() {
  const { activeModal, closeModal, addDailyExpense, addSpecialExpense, savingsOverdue } = useApp();
  const [tab, setTab] = useState<'daily' | 'special'>('daily');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DAILY_CATS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isOpen = activeModal === 'add_transaction';

  const handleClose = () => {
    closeModal();
    setAmount('');
    setDescription('');
    setTab('daily');
    setCategory(DAILY_CATS[0]);
  };

  const handleTabChange = (t: 'daily' | 'special') => {
    setTab(t);
    setCategory(t === 'daily' ? DAILY_CATS[0] : SPECIAL_CATS[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setLoading(true);
    try {
      if (tab === 'daily') {
        await addDailyExpense(val, category, description || category);
      } else {
        await addSpecialExpense(val, category, description || category);
      }
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title="Add Expense">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-900 rounded-xl mb-6">
        {(['daily', 'special'] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
              ${tab === t ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            {t === 'daily' ? <ShoppingBag size={14} /> : <Zap size={14} />}
            {t === 'daily' ? 'Daily' : 'Special'}
          </button>
        ))}
      </div>

      {tab === 'special' && savingsOverdue && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          Special expenses are locked. Please add to your savings first.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono pointer-events-none">Rp</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              required
              className="w-full bg-surface-700 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-semibold font-mono placeholder-gray-700
                focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>
        </div>

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={(tab === 'daily' ? DAILY_CATS : SPECIAL_CATS).map((c) => ({ value: c, label: c }))}
        />

        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you spend on?"
        />

        <Button
          type="submit"
          variant={tab === 'special' && savingsOverdue ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          loading={loading}
          disabled={tab === 'special' && savingsOverdue}
        >
          Record Expense
        </Button>
      </form>
    </Modal>
  );
}
