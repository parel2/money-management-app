import { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  TrendingUp, TrendingDown, PlusCircle, Minus, PiggyBank,
  Zap, Clock, Shield, Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCompact, divide } from '../lib/math';
import { formatTime, todayStr, isSameDay } from '../lib/dates';

export function Dashboard() {
  const { userState, transactions, savings, openModal } = useApp();

  const balance = userState?.current_balance ?? 0;

  const stats = useMemo(() => {
    const today = todayStr();
    const todayTxns = transactions.filter((t) => isSameDay(t.timestamp, today));

    const todayIncome = todayTxns
      .filter((t) => t.type === 'income' || t.type === 'topup')
      .reduce((s, t) => s + t.amount, 0);

    const todayExpense = todayTxns
      .filter((t) => t.type === 'daily_expense' || t.type === 'special_expense')
      .reduce((s, t) => s + t.amount, 0);

    const totalSaved = savings.reduce((s, sv) => s + sv.amount, 0);

    const investmentTotal = savings
      .filter((s) => s.category === 'investment')
      .reduce((s, sv) => s + sv.amount, 0);

    const emergencyTotal = savings
      .filter((s) => s.category === 'emergency')
      .reduce((s, sv) => s + sv.amount, 0);

    // Survival days: balance / avg daily spend
    const expenseTxns = transactions.filter(
      (t) => t.type === 'daily_expense' || t.type === 'special_expense'
    );
    const uniqueDays = new Set(expenseTxns.map((t) => t.timestamp.split('T')[0])).size || 1;
    const totalExpenseAll = expenseTxns.reduce((s, t) => s + t.amount, 0);
    const avgDailySpend = divide(totalExpenseAll, uniqueDays);
    const survivalDays = avgDailySpend > 0 ? Math.floor(divide(balance, avgDailySpend)) : 999;

    // Burn rate per hour
    const now = Date.now();
    const firstTxn = transactions[transactions.length - 1];
    const hoursActive = firstTxn
      ? Math.max(1, (now - new Date(firstTxn.timestamp).getTime()) / 3600000)
      : 1;
    const burnRate = divide(totalExpenseAll, hoursActive);

    // Savings ratio
    const totalIn = transactions
      .filter((t) => t.type === 'income' || t.type === 'topup')
      .reduce((s, t) => s + t.amount, 0);
    const savingsRatio = totalIn > 0 ? divide(totalSaved, totalIn) * 100 : 0;

    return {
      todayIncome, todayExpense, totalSaved,
      investmentTotal, emergencyTotal,
      survivalDays, burnRate, savingsRatio,
    };
  }, [transactions, savings, balance]);

  const recentTxns = transactions.slice(0, 5);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-24"
    >
      {/* Balance Hero */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-surface-800 border border-brand-500/30 p-6 shadow-glow-brand">
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-brand-400/10 pointer-events-none" />
          <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-brand-300/5 pointer-events-none" />

          <p className="text-sm text-brand-200/70 font-medium mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-white tracking-tight font-mono">
            {formatCompact(balance)}
          </p>
          <p className="text-xs text-brand-200/50 mt-1 font-mono">{formatCompact(balance)}</p>

          <div className="flex items-center gap-3 mt-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openModal('topup')}
              icon={<PlusCircle size={14} />}
              className="bg-white/15 border-white/20 hover:bg-white/25 text-white"
            >
              Top-Up
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openModal('add_transaction')}
              icon={<Minus size={14} />}
              className="bg-white/15 border-white/20 hover:bg-white/25 text-white"
            >
              Expense
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openModal('add_saving')}
              icon={<PiggyBank size={14} />}
              className="bg-white/15 border-white/20 hover:bg-white/25 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Today's Summary */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Today In</span>
            <div className="w-7 h-7 rounded-lg bg-green-500/15 flex items-center justify-center">
              <TrendingUp size={13} className="text-green-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-white font-mono">{formatCompact(stats.todayIncome)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Today Out</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
              <TrendingDown size={13} className="text-red-400" />
            </div>
          </div>
          <p className="text-lg font-bold text-white font-mono">{formatCompact(stats.todayExpense)}</p>
        </Card>
      </motion.div>

      {/* Health Metrics */}
      <motion.div variants={item}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
          Financial Health
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <Clock size={16} className="text-amber-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white font-mono">{stats.survivalDays}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Survival Days</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingUp size={16} className="text-brand-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white font-mono">{stats.savingsRatio.toFixed(1)}%</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Savings Ratio</p>
          </Card>
          <Card className="p-3 text-center">
            <Zap size={16} className="text-red-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-white font-mono">{formatCompact(stats.burnRate)}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Burn/Hour</p>
          </Card>
        </div>
      </motion.div>

      {/* Savings Overview */}
      <motion.div variants={item}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
          Savings Vault
        </p>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Total Saved</p>
              <p className="text-2xl font-bold text-white font-mono mt-0.5">{formatCompact(stats.totalSaved)}</p>
            </div>
            <Button size="sm" onClick={() => openModal('add_saving')} icon={<PlusCircle size={13} />}>
              Add
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">
              <TrendingUp size={14} className="text-brand-400 mb-1.5" />
              <p className="text-sm font-bold text-white font-mono">{formatCompact(stats.investmentTotal)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Investment</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <Shield size={14} className="text-green-400 mb-1.5" />
              <p className="text-sm font-bold text-white font-mono">{formatCompact(stats.emergencyTotal)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Emergency</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</p>
        </div>
        <Card className="overflow-hidden">
          {recentTxns.length === 0 ? (
            <div className="p-8 text-center">
              <Wallet size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentTxns.map((t) => {
                const isIn = ['income', 'topup', 'withdrawal'].includes(t.type);
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isIn ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                      {isIn
                        ? <TrendingUp size={14} className="text-green-400" />
                        : <TrendingDown size={14} className="text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{t.description}</p>
                      <p className="text-xs text-gray-500">{t.category} · {formatTime(t.timestamp)}</p>
                    </div>
                    <p className={`text-sm font-bold font-mono flex-shrink-0
                      ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                      {isIn ? '+' : '-'}{formatCompact(t.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
