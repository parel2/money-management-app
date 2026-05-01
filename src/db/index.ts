import Dexie, { Table } from 'dexie';

export type TransactionType = 'income' | 'daily_expense' | 'special_expense' | 'saving' | 'withdrawal' | 'topup';

export type DailyCategory = 'Food' | 'Entertainment' | 'College';
export type SpecialCategory = 'Home' | 'Internet/Data' | 'College' | 'Entertainment' | 'Motorcycle' | 'Style' | 'Others';
export type SavingCategory = 'investment' | 'emergency';

export interface UserState {
  id?: number;
  current_balance: number;
  last_login: string;
  daily_allowance: number;
}

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  timestamp: string;
}

export interface Saving {
  id?: number;
  category: SavingCategory;
  amount: number;
  date: string;
}

export class PocketVaultDB extends Dexie {
  user_state!: Table<UserState, number>;
  transactions!: Table<Transaction, number>;
  savings!: Table<Saving, number>;

  constructor() {
    super('PocketVaultDB');
    this.version(1).stores({
      user_state: '++id',
      transactions: '++id, type, category, timestamp',
      savings: '++id, category, date',
    });
  }
}

export const db = new PocketVaultDB();

