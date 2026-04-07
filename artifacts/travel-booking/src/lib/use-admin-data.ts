// Admin dashboard data with fallback support
import { useState, useEffect } from "react";

// Mock admin data
const mockAdminData = {
  stats: {
    flightBookings: { total: 63, pending: 49, cancelled: 0 },
    hotelBookings: { total: 1, pending: 0, cancelled: 0 },
    holidayBookings: { total: 0, pending: 0, cancelled: 0 },
    busBookings: { total: 16, pending: 0, cancelled: 0 },
    visaBookings: { total: 0, pending: 0, cancelled: 0 },
    activitiesBookings: { total: 0, pending: 0, cancelled: 0 },
    accountBalance: 480,
  },
  allBookings: [
    { type: "Flight", all: 63, pending: 49, cancelled: 0 },
    { type: "Hotel", all: 1, pending: 0, cancelled: 0 },
    { type: "Holiday", all: 0, pending: 0, cancelled: 0 },
    { type: "Bus", all: 16, pending: 0, cancelled: 0 },
    { type: "Visa", all: 0, pending: 0, cancelled: 0 },
    { type: "Activities", all: 0, pending: 0, cancelled: 0 },
    { type: "Umrah", all: 0, pending: 0, cancelled: 0 },
    { type: "Hajj", all: 0, pending: 0, cancelled: 0 },
  ],
  pendingPayments: [
    { company: "ABC Travels", refNo: "PAY001", mode: "Credit Card", amount: 15000, date: "2026-04-05" },
    { company: "XYZ Tours", refNo: "PAY002", mode: "Bank Transfer", amount: 25000, date: "2026-04-04" },
  ],
  agentRequests: [
    { company: "Global Travels", region: "North", status: "Pending", date: "2026-04-03" },
    { company: "Sky Tours", region: "South", status: "Approved", date: "2026-04-02" },
  ],
  refunds: [
    { category: "Flight", allRefunds: 0, openedRefund: 0, closedRefund: 0 },
    { category: "Hotel", allRefunds: 0, openedRefund: 0, closedRefund: 0 },
    { category: "Holidays", allRefunds: 0, openedRefund: 0, closedRefund: 0 },
    { category: "Bus", allRefunds: 0, openedRefund: 0, closedRefund: 0 },
    { category: "Visa", allRefunds: 0, openedRefund: 0, closedRefund: 0 },
  ],
  changeRequests: [
    { status: "All Request", requested: 0, approved: 0, rejected: 0, processing: 0 },
  ],
};

export function useAdminData() {
  const [data] = useState(mockAdminData);
  const [isLoading] = useState(false);

  return { data, isLoading };
}
