import { db, UserState, Transaction, Saving } from '../db';

interface MigrationPayload {
  version: number;
  exported_at: string;
  user_state: UserState[];
  transactions: Transaction[];
  savings: Saving[];
}

export async function exportData(): Promise<string> {
  const [user_state, transactions, savings] = await Promise.all([
    db.user_state.toArray(),
    db.transactions.toArray(),
    db.savings.toArray(),
  ]);

  const payload: MigrationPayload = {
    version: 1,
    exported_at: new Date().toISOString(),
    user_state,
    transactions,
    savings,
  };

  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export async function importData(code: string): Promise<void> {
  let payload: MigrationPayload;
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    payload = JSON.parse(json) as MigrationPayload;
  } catch {
    throw new Error('Invalid migration code. Please check and try again.');
  }

  if (!payload.version || !payload.user_state || !payload.transactions || !payload.savings) {
    throw new Error('Migration code has an invalid schema.');
  }

  await db.transaction('rw', [db.user_state, db.transactions, db.savings], async () => {
    await db.user_state.clear();
    await db.transactions.clear();
    await db.savings.clear();

    for (const row of payload.user_state) {
      const { id: _id, ...rest } = row;
      await db.user_state.add(rest);
    }
    for (const row of payload.transactions) {
      const { id: _id, ...rest } = row;
      await db.transactions.add(rest);
    }
    for (const row of payload.savings) {
      const { id: _id, ...rest } = row;
      await db.savings.add(rest);
    }
  });
}
