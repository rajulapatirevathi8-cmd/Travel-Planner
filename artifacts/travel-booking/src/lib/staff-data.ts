// ── Staff data helpers (localStorage-backed) ─────────────────────────────────

export interface FollowUp {
  leadId: string;
  staffId: string;
  date: string;
  note: string;
}

export interface IncentiveConfig {
  fixedAmount: number;
  profitPercent: number;
}

const FOLLOWUP_KEY         = "staff_followups";
const BOOKINGS_KEY         = "staff_bookings";
const INCENTIVE_CONFIG_KEY = "staff_incentive_config";

const DEFAULT_CONFIG: IncentiveConfig = { fixedAmount: 200, profitPercent: 5 };

export function getIncentiveConfig(): IncentiveConfig {
  try {
    const raw = localStorage.getItem(INCENTIVE_CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { return DEFAULT_CONFIG; }
}

export function saveIncentiveConfig(config: IncentiveConfig): void {
  localStorage.setItem(INCENTIVE_CONFIG_KEY, JSON.stringify(config));
}

export function calculateIncentive(profit: number, config?: IncentiveConfig): number {
  const cfg = config ?? getIncentiveConfig();
  return cfg.fixedAmount + Math.round((profit * cfg.profitPercent) / 100);
}

export const INCENTIVE_PER_BOOKING = DEFAULT_CONFIG.fixedAmount;

export interface StaffBookingRecord {
  id: string;
  staffId: string;
  staffName: string;
  bookingRef: string;
  type: "flight" | "bus" | "hotel";
  amount: number;
  profit: number;
  incentive: number;
  customerName: string;
  date: string;
}

function readFollowUps(): FollowUp[] {
  try { return JSON.parse(localStorage.getItem(FOLLOWUP_KEY) ?? "[]"); } catch { return []; }
}

function readBookings(): StaffBookingRecord[] {
  try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? "[]"); } catch { return []; }
}

export function getFollowUps(staffId: string): FollowUp[] {
  return readFollowUps().filter((f) => f.staffId === staffId);
}

export function getAllFollowUps(): FollowUp[] {
  return readFollowUps();
}

export function setFollowUp(leadId: string, staffId: string, date: string, note: string): void {
  const all = readFollowUps().filter((f) => !(f.leadId === leadId && f.staffId === staffId));
  if (date) all.push({ leadId, staffId, date, note });
  localStorage.setItem(FOLLOWUP_KEY, JSON.stringify(all));
}

export function getFollowUp(leadId: string, staffId: string): FollowUp | undefined {
  return readFollowUps().find((f) => f.leadId === leadId && f.staffId === staffId);
}

export function getTodayFollowUps(staffId: string): FollowUp[] {
  const today = new Date().toISOString().split("T")[0];
  return readFollowUps().filter((f) => f.staffId === staffId && f.date === today);
}

export function logStaffBooking(b: Omit<StaffBookingRecord, "id" | "incentive">): void {
  const config = getIncentiveConfig();
  const all    = readBookings();
  const record: StaffBookingRecord = {
    ...b,
    id:       `sb_${Date.now()}`,
    incentive: calculateIncentive(b.profit, config),
  };
  all.push(record);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
}

export function getStaffBookings(staffId: string): StaffBookingRecord[] {
  return readBookings().filter((b) => b.staffId === staffId);
}

export function getAllStaffBookings(): StaffBookingRecord[] {
  return readBookings();
}

export function recalculateAllIncentives(): void {
  const config   = getIncentiveConfig();
  const bookings = readBookings().map((b) => ({
    ...b,
    incentive: calculateIncentive(b.profit ?? 0, config),
  }));
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getStaffPerformance(staffId: string, leads: any[]): {
  assigned: number;
  conversions: number;
  bookings: number;
  totalIncentive: number;
  totalProfit: number;
} {
  const assigned    = leads.filter((l) => l.assignedTo === staffId).length;
  const conversions = leads.filter((l) => l.assignedTo === staffId && l.status === "booked").length;
  const staffBks    = getStaffBookings(staffId);
  return {
    assigned,
    conversions,
    bookings:       staffBks.length,
    totalIncentive: staffBks.reduce((s, b) => s + b.incentive, 0),
    totalProfit:    staffBks.reduce((s, b) => s + (b.profit ?? 0), 0),
  };
}
