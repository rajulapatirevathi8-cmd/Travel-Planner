/**
 * useMarketing — Automated marketing event hook
 *
 * Call `fireSearchEvent` after a user performs a search.
 * Call `fireBookingEvent` after a successful booking.
 *
 * The backend will schedule:
 *   - Search trigger: WhatsApp after 10 min (if no booking made)
 *   - Booking follow-up: WhatsApp after 6 hours
 */

import { useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";

interface SearchEventData {
  searchType: "flight" | "hotel" | "bus";
  from?:      string;
  to?:        string;
}

interface BookingEventData {
  bookingId:   string;
  bookingType: "flight" | "hotel" | "bus" | "package";
  from?:       string;
  to?:         string;
}

const SESSION_KEY = "ww_mkt_search_fired";

export function useMarketing() {
  const { user } = useAuth();

  const fireSearchEvent = useCallback(
    (data: SearchEventData) => {
      if (!user?.id && !user?.phone) return;

      // Fire once per session per type (prevent spam on every re-render)
      const sessionKey = `${SESSION_KEY}_${data.searchType}`;
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");

      const payload = {
        userId:     user?.id   ? String(user.id) : `guest_${Date.now()}`,
        name:       user?.name  || "Traveller",
        phone:      user?.phone || "",
        searchType: data.searchType,
        from:       data.from || "",
        to:         data.to   || "",
      };

      fetch("/api/marketing/search-event", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      }).catch(() => {});
    },
    [user],
  );

  const fireBookingEvent = useCallback(
    (data: BookingEventData) => {
      if (!user?.id && !user?.phone) return;

      // Clear search session flags (user has booked)
      ["flight", "hotel", "bus"].forEach((t) =>
        sessionStorage.removeItem(`${SESSION_KEY}_${t}`),
      );

      const payload = {
        userId:      user?.id   ? String(user.id) : `guest_${Date.now()}`,
        name:        user?.name  || "Traveller",
        phone:       user?.phone || "",
        bookingId:   data.bookingId,
        bookingType: data.bookingType,
        from:        data.from || "",
        to:          data.to   || "",
      };

      fetch("/api/marketing/booking-followup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      }).catch(() => {});
    },
    [user],
  );

  return { fireSearchEvent, fireBookingEvent };
}
