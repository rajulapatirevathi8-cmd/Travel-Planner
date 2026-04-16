// ── Agent Wallet System ───────────────────────────────────────────────────
//
// Single source of truth for all agent wallet operations.
// Operates on the same localStorage "users" key that auth-context.tsx uses,
// so the agent's walletBalance is always in sync with their login session.
//
// Transaction log stored in localStorage key "agent_wallet_txns".
//
// Public API:
//   getWalletBalance(userId)
//   creditWallet(userId, amount, note)           → new balance
//   deductWallet(userId, amount, note, ref?)     → { ok, newBalance }
//   getWalletTxns(userId)
//   getAllAgentWallets()                          → for admin view

const USERS_KEY  = "users";
const TXNS_KEY   = "agent_wallet_txns";

export interface WalletTxn {
  id: string;
  userId: string;
  type: "credit" | "debit";
  amount: number;
  note: string;
  createdAt: string;
  bookingRef?: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────

function readUsers(): any[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeUsers(users: any[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // Keep current session in sync if it belongs to this update
  try {
    const sessionRaw = localStorage.getItem("user");
    if (!sessionRaw) return;
    const session = JSON.parse(sessionRaw);
    const fresh = users.find((u) => u.id === session.id);
    if (fresh) {
      const { password: _, ...safeUser } = fresh;
      localStorage.setItem("user", JSON.stringify(safeUser));
    }
  } catch { /* ignore */ }
}

function readTxns(): WalletTxn[] {
  try {
    const raw = localStorage.getItem(TXNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeTxns(txns: WalletTxn[]): void {
  localStorage.setItem(TXNS_KEY, JSON.stringify(txns));
}

function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function appendTxn(txn: Omit<WalletTxn, "id" | "createdAt">): void {
  const txns = readTxns();
  txns.push({ ...txn, id: genId(), createdAt: new Date().toISOString() });
  writeTxns(txns);
}

// ── Public API ────────────────────────────────────────────────────────────

/** Returns the current wallet balance for the given user ID. */
export function getWalletBalance(userId: string): number {
  const users = readUsers();
  const user  = users.find((u) => u.id === userId);
  return user?.walletBalance ?? 0;
}

/**
 * Credits (adds) an amount to an agent's wallet and records a transaction.
 * Returns the new balance.
 */
export function creditWallet(userId: string, amount: number, note: string): number {
  if (amount <= 0) return getWalletBalance(userId);
  const users = readUsers();
  const idx   = users.findIndex((u) => u.id === userId);
  if (idx === -1) return 0;

  const newBalance = (users[idx].walletBalance ?? 0) + amount;
  users[idx].walletBalance = newBalance;
  writeUsers(users);
  appendTxn({ userId, type: "credit", amount, note });
  return newBalance;
}

/**
 * Deducts (subtracts) an amount from an agent's wallet.
 * Returns `{ ok: true, newBalance }` on success or `{ ok: false, newBalance: current }` if insufficient funds.
 */
export function deductWallet(
  userId: string,
  amount: number,
  note: string,
  bookingRef?: string,
): { ok: boolean; newBalance: number } {
  if (amount <= 0) return { ok: true, newBalance: getWalletBalance(userId) };
  const users   = readUsers();
  const idx     = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { ok: false, newBalance: 0 };

  const current = users[idx].walletBalance ?? 0;
  if (current < amount) return { ok: false, newBalance: current };

  const newBalance = current - amount;
  users[idx].walletBalance = newBalance;
  writeUsers(users);
  appendTxn({ userId, type: "debit", amount, note, bookingRef });
  return { ok: true, newBalance };
}

/** Returns all wallet transactions for a given user, newest first. */
export function getWalletTxns(userId: string): WalletTxn[] {
  return readTxns()
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Returns wallet info for ALL agents (for admin view). */
export function getAllAgentWallets(): {
  id: string;
  name: string;
  email: string;
  agentCode?: string;
  walletBalance: number;
  totalCredited: number;
  totalDebited: number;
  txnCount: number;
}[] {
  const users = readUsers().filter((u) => u.role === "agent");
  const txns  = readTxns();
  return users.map((u) => {
    const myTxns      = txns.filter((t) => t.userId === u.id);
    const totalCredited = myTxns.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const totalDebited  = myTxns.filter((t) => t.type === "debit" ).reduce((s, t) => s + t.amount, 0);
    return {
      id:           u.id,
      name:         u.name,
      email:        u.email,
      agentCode:    u.agentCode,
      walletBalance: u.walletBalance ?? 0,
      totalCredited,
      totalDebited,
      txnCount:     myTxns.length,
    };
  });
}
