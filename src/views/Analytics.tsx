import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { formatCompact, formatCurrency } from '../lib/math';
import { getLast30Days, getLast90Days, isSameDay } from '../lib/dates';

const COLORS = ['#0369d1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

export function Analytics() {
  const { transactions, savings } = useApp();

  const expenseVelocity = useMemo(() => {
    const hourBuckets: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourBuckets[h] = 0;
    transactions
      .filter((t) => t.type === 'daily_expense' || t.type === 'special_expense')
      .forEach((t) => {
        const h = new Date(t.timestamp).getHours();
        hourBuckets[h] += t.amount;
      });
    return Object.entries(hourBuckets).map(([h, amount]) => ({
      hour: `${String(h).padStart(2, '0')}:00`,
      amount,
    }));
  }, [transactions]);

  const allocationData = useMemo(() => {
    const daily = transactions
      .filter((t) => t.type === 'daily_expense')
      .reduce((s, t) => s + t.amount, 0);
    const special = transactions
      .filter((t) => t.type === 'special_expense')
      .reduce((s, t) => s + t.amount, 0);
    const saved = transactions
      .filter((t) => t.type === 'saving')
      .reduce((s, t) => s + t.amount, 0);
    return [
      { name: 'Daily Expenses', value: daily },
      { name: 'Special Expenses', value: special },
      { name: 'Savings', value: saved },
    ].filter((d) => d.value > 0);
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'daily_expense' || t.type === 'special_expense')
      .forEach((t) => {
        cats[t.category] = (cats[t.category] ?? 0) + t.amount;
      });
    return Object.entries(cats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [transactions]);

  const savingsHeatmap = useMemo(() => {
    const days = getLast90Days();
    const savingDates = new Set(savings.map((s) => s.date.split('T')[0]));
    return days.map((d) => ({
      date: d,
      saved: savingDates.has(d),
    }));
  }, [savings]);

  const spendingTrend = useMemo(() => {
    const days = getLast30Days();
    return days.map((d) => {
      const dayTxns = transactions.filter(
        (t) => (t.type === 'daily_expense' || t.type === 'special_expense') && isSameDay(t.timestamp, d)
      );
      return {
        day: d.slice(5),
        amount: dayTxns.reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions]);

  const maxCatAmount = categoryBreakdown[0]?.[1] ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-24"
    >
      {/* Spending Trend */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-white mb-4">Spending Trend (30 days)</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spendingTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCompact(v).replace('Rp ', '')}
              />
              <Tooltip
                contentStyle={{ background: '#12192e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(v: unknown) => [formatCurrency(v as number), 'Spent']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#0369d1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#0369d1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Expense Velocity */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-white mb-4">Expense Velocity (by Hour)</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={expenseVelocity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#6b7280', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCompact(v).replace('Rp ', '')}
              />
              <Tooltip
                contentStyle={{ background: '#12192e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                formatter={(v: unknown) => [formatCurrency(v as number), 'Spent']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Allocation Pie */}
      {allocationData.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-semibold text-white mb-4">Allocation Breakdown</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#12192e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: unknown) => [formatCurrency(v as number)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-semibold text-white mb-4">Top Spending Categories</p>
          <div className="space-y-3">
            {categoryBreakdown.map(([cat, amount], idx) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{cat}</span>
                  <span className="text-sm font-bold font-mono text-white">{formatCompact(amount)}</span>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(amount / maxCatAmount) * 100}%` }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: COLORS[idx % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Savings Calendar / Heatmap */}
      <Card className="p-4">
        <p className="text-sm font-semibold text-white mb-4">Savings Consistency (90 days)</p>
        <div className="flex flex-wrap gap-1">
          {savingsHeatmap.map(({ date, saved }) => (
            <div
              key={date}
              title={date}
              className={`w-3.5 h-3.5 rounded-sm transition-colors
                ${saved ? 'bg-green-500' : 'bg-surface-700'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-xs text-gray-500">Saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-surface-700" />
            <span className="text-xs text-gray-500">Missed</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

