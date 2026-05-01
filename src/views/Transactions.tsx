import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCompact } from '../lib/math';
import { formatTimestamp, formatDate } from '../lib/dates';
import { Transaction, TransactionType } from '../db';

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Income',
  topup: 'Top-Up',
  daily_expense: 'Daily',
  special_expense: 'Special',
  saving: 'Saving',
  withdrawal: 'Withdrawal',
};

const TYPE_COLORS: Record<TransactionType, string> = {
  income: 'text-green-400 bg-green-500/15',
  topup: 'text-cyan-400 bg-cyan-500/15',
  daily_expense: 'text-red-400 bg-red-500/15',
  special_expense: 'text-orange-400 bg-orange-500/15',
  saving: 'text-brand-400 bg-brand-500/15',
  withdrawal: 'text-amber-400 bg-amber-500/15',
};

const INCOME_TYPES: TransactionType[] = ['income', 'topup', 'withdrawal'];

function groupByDate(txns: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  for (const t of txns) {
    const d = t.timestamp.split('T')[0];
    if (!groups[d]) groups[d] = [];
    groups[d].push(t);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

export function Transactions() {
  const { transactions, openModal } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = filter === 'all' || t.type === filter;
      const matchSearch = !search ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, filter, search]);

  const grouped = groupByDate(filtered);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-24"
    >
      {/* Search + Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-surface-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600
              focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>
        <Button size="sm" onClick={() => openModal('add_transaction')} icon={<Filter size={13} />}>
          Add
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {(['all', 'income', 'topup', 'daily_expense', 'special_expense', 'saving', 'withdrawal'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
              ${filter === f
                ? 'bg-brand-500 border-brand-400/50 text-white'
                : 'bg-surface-800 border-white/10 text-gray-400 hover:text-white'}`}
          >
            {f === 'all' ? 'All' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Grouped List */}
      {grouped.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-gray-500 text-sm">No transactions found</p>
        </Card>
      ) : (
        grouped.map(([date, txns]) => (
          <div key={date}>
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-gray-500">{formatDate(date)}</p>
              <p className="text-xs text-gray-600">
                {txns.length} transaction{txns.length > 1 ? 's' : ''}
              </p>
            </div>
            <Card className="overflow-hidden">
              <div className="divide-y divide-white/5">
                {txns.map((t) => {
                  const isIn = INCOME_TYPES.includes(t.type);
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[t.type]}`}>
                        {isIn
                          ? <TrendingUp size={14} />
                          : <TrendingDown size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{t.description}</p>
                          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${TYPE_COLORS[t.type]}`}>
                            {TYPE_LABELS[t.type]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t.category} · {formatTimestamp(t.timestamp).split(',')[1]?.trim()}
                        </p>
                      </div>
                      <p className={`text-sm font-bold font-mono flex-shrink-0 ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                        {isIn ? '+' : '-'}{formatCompact(t.amount)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>
        ))
      )}
    </motion.div>
  );
}
