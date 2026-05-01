import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { db, Transaction, Saving, UserState } from '../db';
import { add, subtract } from '../lib/math';
import { todayStr, isSameDay, hoursSince } from '../lib/dates';

export type ActiveView = 'dashboard' | 'transactions' | 'savings' | 'analytics' | 'settings';
export type ModalType = 'daily_gatekeeper' | 'add_transaction' | 'topup' | 'add_saving' | 'migration' | null;

interface AppState {
  initialized: boolean;
  userState: UserState | null;
  transactions: Transaction[];
  savings: Saving[];
  activeView: ActiveView;
  activeModal: ModalType;
  hasDailyEntry: boolean;
  savingsOverdue: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

type Action =
  | { type: 'INIT'; payload: { userState: UserState | null; transactions: Transaction[]; savings: Saving[] } }
  | { type: 'SET_VIEW'; payload: ActiveView }
  | { type: 'OPEN_MODAL'; payload: ModalType }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_TOAST'; payload: AppState['toast'] }
  | { type: 'REFRESH'; payload: { userState: UserState | null; transactions: Transaction[]; savings: Saving[] } };

function computeDerivedFlags(
  transactions: Transaction[],
  savings: Saving[]
): { hasDailyEntry: boolean; savingsOverdue: boolean } {
  const today = todayStr();

  const hasDailyEntry = transactions.some(
    (t) => (t.type === 'income' || t.type === 'topup') && isSameDay(t.timestamp, today)
  );

  const recentInvestment = savings.some(
    (s) => s.category === 'investment' && hoursSince(s.date) < 24
  );
  const recentEmergency = savings.some(
    (s) => s.category === 'emergency' && hoursSince(s.date) < 24
  );

  // overdue only if user has existing savings history (already onboarded)
  const hasAnySaving = savings.length > 0;
  const savingsOverdue = hasAnySaving && (!recentInvestment || !recentEmergency);

  return { hasDailyEntry, savingsOverdue };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT': {
      const { userState, transactions, savings } = action.payload;
      const flags = computeDerivedFlags(transactions, savings);
      return {
        ...state,
        initialized: true,
        userState,
        transactions,
        savings,
        ...flags,
      };
    }
    case 'REFRESH': {
      const { userState, transactions, savings } = action.payload;
      const flags = computeDerivedFlags(transactions, savings);
      return { ...state, userState, transactions, savings, ...flags };
    }
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };
    case 'OPEN_MODAL':
      return { ...state, activeModal: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, activeModal: null };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    default:
      return state;
  }
}

const initialState: AppState = {
  initialized: false,
  userState: null,
  transactions: [],
  savings: [],
  activeView: 'dashboard',
  activeModal: null,
  hasDailyEntry: false,
  savingsOverdue: false,
  toast: null,
};

interface AppContextValue extends AppState {
  setView: (v: ActiveView) => void;
  openModal: (m: ModalType) => void;
  closeModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  submitDailyIncome: (amount: number) => Promise<void>;
  addTopUp: (amount: number, description: string) => Promise<void>;
  addDailyExpense: (amount: number, category: string, description: string) => Promise<void>;
  addSpecialExpense: (amount: number, category: string, description: string) => Promise<void>;
  addSaving: (category: 'investment' | 'emergency', amount: number) => Promise<void>;
  withdrawSaving: (savingId: number, amount: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

async function loadAll() {
  const [userStateArr, transactions, savings] = await Promise.all([
    db.user_state.toArray(),
    db.transactions.orderBy('timestamp').reverse().toArray(),
    db.savings.orderBy('date').reverse().toArray(),
  ]);
  return {
    userState: userStateArr[0] ?? null,
    transactions,
    savings,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    const data = await loadAll();
    dispatch({ type: 'REFRESH', payload: data });
  }, []);

  useEffect(() => {
    (async () => {
      const data = await loadAll();
      dispatch({ type: 'INIT', payload: data });

      // Show gatekeeper if no daily income for today
      const today = todayStr();
      const hasTodayIncome = data.transactions.some(
        (t) => (t.type === 'income' || t.type === 'topup') && isSameDay(t.timestamp, today)
      );
      if (!hasTodayIncome) {
        dispatch({ type: 'OPEN_MODAL', payload: 'daily_gatekeeper' });
      }
    })();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 3000);
    return () => clearTimeout(timer);
  }, [state.toast]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      dispatch({ type: 'SET_TOAST', payload: { message, type } });
    },
    []
  );

  const getOrCreateUserState = async (): Promise<UserState & { id: number }> => {
    const all = await db.user_state.toArray();
    if (all[0]) return all[0] as UserState & { id: number };
    const id = await db.user_state.add({
      current_balance: 0,
      last_login: new Date().toISOString(),
      daily_allowance: 0,
    });
    return { id, current_balance: 0, last_login: new Date().toISOString(), daily_allowance: 0 };
  };

  const submitDailyIncome = useCallback(async (amount: number) => {
    const us = await getOrCreateUserState();
    const newBalance = add(us.current_balance, amount);
    await db.user_state.update(us.id!, {
      current_balance: newBalance,
      last_login: new Date().toISOString(),
      daily_allowance: amount,
    });
    await db.transactions.add({
      type: 'income',
      amount,
      category: 'Income',
      description: 'Daily Income',
      timestamp: new Date().toISOString(),
    });
    await refresh();
    showToast('Daily income recorded!', 'success');
  }, [refresh, showToast]);

  const addTopUp = useCallback(async (amount: number, description: string) => {
    const us = await getOrCreateUserState();
    const newBalance = add(us.current_balance, amount);
    await db.user_state.update(us.id!, { current_balance: newBalance });
    await db.transactions.add({
      type: 'topup',
      amount,
      category: 'Top-Up',
      description,
      timestamp: new Date().toISOString(),
    });
    await refresh();
    showToast('Balance topped up!', 'success');
  }, [refresh, showToast]);

  const addDailyExpense = useCallback(async (amount: number, category: string, description: string) => {
    const us = await getOrCreateUserState();
    if (us.current_balance < amount) {
      showToast('Insufficient balance!', 'error');
      return;
    }
    const newBalance = subtract(us.current_balance, amount);
    await db.user_state.update(us.id!, { current_balance: newBalance });
    await db.transactions.add({
      type: 'daily_expense',
      amount,
      category,
      description,
      timestamp: new Date().toISOString(),
    });
    await refresh();
    showToast('Expense recorded.', 'success');
  }, [refresh, showToast]);

  const addSpecialExpense = useCallback(async (amount: number, category: string, description: string) => {
    if (state.savingsOverdue) {
      showToast('Save first before adding special expenses!', 'error');
      return;
    }
    const us = await getOrCreateUserState();
    if (us.current_balance < amount) {
      showToast('Insufficient balance!', 'error');
      return;
    }
    const newBalance = subtract(us.current_balance, amount);
    await db.user_state.update(us.id!, { current_balance: newBalance });
    await db.transactions.add({
      type: 'special_expense',
      amount,
      category,
      description,
      timestamp: new Date().toISOString(),
    });
    await refresh();
    showToast('Special expense recorded.', 'success');
  }, [state.savingsOverdue, refresh, showToast]);

  const addSaving = useCallback(async (category: 'investment' | 'emergency', amount: number) => {
    const minAmount = category === 'investment' ? 10000 : 5000;
    if (amount < minAmount) {
      showToast(`Minimum for ${category} is Rp ${minAmount.toLocaleString('id-ID')}`, 'error');
      return;
    }
    const us = await getOrCreateUserState();
    if (us.current_balance < amount) {
      showToast('Insufficient balance!', 'error');
      return;
    }
    const newBalance = subtract(us.current_balance, amount);
    await db.user_state.update(us.id!, { current_balance: newBalance });
    await db.savings.add({
      category,
      amount,
      date: new Date().toISOString(),
    });
    await db.transactions.add({
      type: 'saving',
      amount,
      category: category === 'investment' ? 'Investment' : 'Emergency Fund',
      description: `Saving to ${category}`,
      timestamp: new Date().toISOString(),
    });
    await refresh();
    showToast('Saved successfully!', 'success');
  }, [refresh, showToast]);

  const withdrawSaving = useCallback(async (savingId: number, amount: number) => {
    const saving = await db.savings.get(savingId);
    if (!saving) return;
    await db.savings.delete(savingId);
    const us = await getOrCreateUserState();
    const newBalance = add(us.current_balance, amount);
    await db.user_state.update(us.id!, { current_balance: newBalance });
    await db.transactions.add({
      type: 'withdrawal',
      amount,
      category: saving.category === 'investment' ? 'Investment' : 'Emergency Fund',
      description: `Withdrawal from ${saving.category}`,
      timestamp: new Date().toISOString(),
    });
    await refresh();
    showToast('Withdrawal completed.', 'success');
  }, [refresh, showToast]);

  const value: AppContextValue = {
    ...state,
    setView: (v) => dispatch({ type: 'SET_VIEW', payload: v }),
    openModal: (m) => dispatch({ type: 'OPEN_MODAL', payload: m }),
    closeModal: () => dispatch({ type: 'CLOSE_MODAL' }),
    showToast,
    submitDailyIncome,
    addTopUp,
    addDailyExpense,
    addSpecialExpense,
    addSaving,
    withdrawSaving,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

