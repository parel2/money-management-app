import { motion } from 'framer-motion';
import { LayoutDashboard, List, PiggyBank, BarChart2, Settings, Video as LucideIcon } from 'lucide-react';
import { useApp, ActiveView } from '../../context/AppContext';

const TABS: { id: ActiveView; icon: LucideIcon; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
  { id: 'transactions', icon: List, label: 'Ledger' },
  { id: 'savings', icon: PiggyBank, label: 'Savings' },
  { id: 'analytics', icon: BarChart2, label: 'Insights' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const { activeView, setView } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="bg-surface-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-2">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {TABS.map(({ id, icon: Icon, label }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-brand-500/15 rounded-xl border border-brand-500/25"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={20} />
                <span
                  className={`text-[10px] font-medium transition-colors relative
                    ${isActive ? 'text-brand-400' : 'text-gray-500'}`}
                >
                  {label}
                </span>
                <div className={`absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full transition-all ${isActive ? 'bg-brand-400' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

