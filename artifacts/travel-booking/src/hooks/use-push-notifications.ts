import { useEffect, useCallback, useRef } from "react";
import {
  requestPermissionAndGetToken,
  listenForForegroundMessages,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const BASE = () => (import.meta.env.BASE_URL ?? "").replace(/\/$/, "");
const TOKEN_KEY = "ww_fcm_token";

interface PushUser {
  id?:    string;
  name?:  string;
  phone?: string;
  email?: string;
}

async function registerToken(token: string, user?: PushUser): Promise<void> {
  try {
    await fetch(`${BASE()}/api/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        userId: user?.id,
        name:   user?.name,
        phone:  user?.phone,
        email:  user?.email,
        platform: "web",
      }),
    });
  } catch (err) {
    console.warn("[push] Token registration failed:", err);
  }
}

export function usePushNotifications(user?: PushUser): {
  requestPermission: () => Promise<void>;
  isConfigured: boolean;
} {
  const { toast } = useToast();
  const initialized = useRef(false);

  const requestPermission = useCallback(async () => {
    if (!isFirebaseConfigured()) return;

    const token = await requestPermissionAndGetToken();
    if (!token) return;

    const prev = localStorage.getItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);

    if (prev !== token) {
      await registerToken(token, user);
    }
  }, [user]);

  useEffect(() => {
    if (initialized.current) return;
    if (!isFirebaseConfigured()) return;
    initialized.current = true;

    const existing = localStorage.getItem(TOKEN_KEY);
    if (existing && Notification.permission === "granted") {
      registerToken(existing, user).catch(() => {});
    }

    const unsubscribe = listenForForegroundMessages((payload) => {
      toast({
        title:       payload.title,
        description: payload.body,
        duration:    6000,
      });
    });

    return () => { unsubscribe?.(); };
  }, []);

  return { requestPermission, isConfigured: isFirebaseConfigured() };
}
