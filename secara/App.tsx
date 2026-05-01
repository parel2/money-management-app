import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Toast } from './components/ui/Toast';
import { DailyGatekeeper } from './components/modals/DailyGatekeeper';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { TopUpModal } from './components/modals/TopUpModal';
import { AddSavingModal } from './components/modals/AddSavingModal';
import { Dashboard } from './views/Dashboard';
import { Transactions } from './views/Transactions';
import { Savings } from './views/Savings';
import { Analytics } from './views/Analytics';
import { Settings } from './views/Settings';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function AppShell() {
  const { activeView, initialized } = useApp();

  if (!initialized) {
    return (
      <div className="fixed inset-0 bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-glow-brand">
            <span className="text-xl font-bold text-white">PV</span>
          </div>
          <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900 font-sans">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'transactions' && <Transactions />}
            {activeView === 'savings' && <Savings />}
            {activeView === 'analytics' && <Analytics />}
            {activeView === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      <DailyGatekeeper />
      <AddTransactionModal />
      <TopUpModal />
      <AddSavingModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
