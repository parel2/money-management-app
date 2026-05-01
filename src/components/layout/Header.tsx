import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'PocketVault',
  transactions: 'Ledger',
  savings: 'Savings Vault',
  analytics: 'Executive Insights',
  settings: 'Settings',
};

export function Header() {
  const { activeView, savingsOverdue } = useApp();

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-white">PV</span>
            </div>
            <h1 className="text-base font-semibold text-white">{VIEW_TITLES[activeView]}</h1>
          </div>
          <div className="flex items-center gap-2">
            {savingsOverdue && (
              <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-1.5">
                <AlertTriangle size={12} className="text-red-400" />
                <span className="text-xs text-red-400 font-medium">Save Required</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {savingsOverdue && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-center">
          <p className="text-xs text-red-400 font-medium">
            24-hour savings window missed. Add investment (min Rp 10K) and emergency (min Rp 5K) savings to unlock special expenses.
          </p>
        </div>
      )}
    </>
  );
}
