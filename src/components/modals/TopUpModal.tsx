import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function TopUpModal() {
  const { activeModal, closeModal, addTopUp } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const isOpen = activeModal === 'topup';

  const handleClose = () => {
    closeModal();
    setAmount('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setLoading(true);
    try {
      await addTopUp(val, description || 'Top-Up');
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title="Add Income / Top-Up">
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
              autoFocus
              className="w-full bg-surface-700 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-semibold font-mono placeholder-gray-700
                focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
          </div>
        </div>

        <Input
          label="Source / Note"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Freelance payment, bonus..."
        />

        <Button
          type="submit"
          variant="success"
          size="lg"
          fullWidth
          loading={loading}
          icon={<PlusCircle size={18} />}
        >
          Add to Balance
        </Button>
      </form>
    </Modal>
  );
}
