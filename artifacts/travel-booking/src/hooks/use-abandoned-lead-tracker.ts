import { useEffect, useRef } from "react";
import { saveAbandonedLead } from "@/lib/crm";

type TravelType = "flight" | "hotel" | "bus";

/**
 * Detects when an authenticated user views search results but leaves without
 * booking. Saves an "abandoned" CRM lead and triggers WhatsApp re-engagement.
 *
 * Only fires for logged-in users with a phone number.
 * Deduplication is handled server-side (2-hour window).
 */
export function useAbandonedLeadTracker(type: TravelType) {
  const bookedRef = useRef(false);

  const markBooked = () => {
    bookedRef.current = true;
  };

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return;

    let user: { name?: string; phone?: string; email?: string } | null = null;
    try { user = JSON.parse(rawUser); } catch { return; }

    if (!user?.name || !user?.phone) return;

    const name  = user.name.trim();
    const phone = user.phone.trim();
    const email = user.email?.trim();

    if (!name || !phone) return;

    const sessionKey = `ww_abandon_${type}_${phone}`;
    const alreadyTracked = sessionStorage.getItem(sessionKey);
    if (alreadyTracked) return;

    sessionStorage.setItem(sessionKey, "1");

    return () => {
      if (!bookedRef.current) {
        const notes = `Searched ${type}s but did not complete booking`;
        saveAbandonedLead(name, phone, type, email, notes);
      }
    };
  }, [type]);

  return { markBooked };
}
