/**
 * Firebase Admin SDK — push notification sender
 *
 * Credentials are read from environment variables:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (PEM — newlines encoded as \n)
 *
 * If credentials are missing the module still loads cleanly; send functions
 * return { sent: false, reason: "Firebase not configured" }.
 */

import admin from "firebase-admin";

let app: admin.app.App | null = null;

function getApp(): admin.app.App | null {
  if (app) return app;

  const projectId   = process.env.FIREBASE_PROJECT_ID   || "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const privateKey  = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.info("[firebase-admin] Credentials not configured — push disabled");
    return null;
  }

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    console.info("[firebase-admin] App initialised ✓");
  } catch (err: any) {
    console.error("[firebase-admin] Init failed:", err.message);
    app = null;
  }

  return app;
}

export interface PushPayload {
  token:   string;
  title:   string;
  body:    string;
  icon?:   string;
  url?:    string;
  imageUrl?: string;
  data?:   Record<string, string>;
}

export async function sendPushToToken(
  payload: PushPayload,
): Promise<{ sent: boolean; messageId?: string; reason?: string }> {
  const firebaseApp = getApp();
  if (!firebaseApp) return { sent: false, reason: "Firebase not configured" };

  try {
    const messaging = firebaseApp.messaging();
    const messageId = await messaging.send({
      token:   payload.token,
      notification: {
        title: payload.title,
        body:  payload.body,
        ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      },
      webpush: {
        notification: {
          icon:  payload.icon  || "/favicon.svg",
          badge: payload.icon  || "/favicon.svg",
          ...(payload.url ? { click_action: payload.url } : {}),
        },
        fcmOptions: payload.url ? { link: payload.url } : undefined,
      },
      data: payload.data || {},
    });
    console.info(`[firebase-admin] Sent ✓ messageId: ${messageId}`);
    return { sent: true, messageId };
  } catch (err: any) {
    const reason = err.message || "Unknown error";
    const isExpired =
      err.code === "messaging/registration-token-not-registered" ||
      err.code === "messaging/invalid-registration-token";
    console.error(`[firebase-admin] Failed: ${reason} (expired=${isExpired})`);
    return { sent: false, reason, ...(isExpired ? { expired: true } : {}) };
  }
}

export async function sendPushToTokens(
  tokens: string[],
  payload: Omit<PushPayload, "token">,
): Promise<{ sent: number; failed: number; expiredTokens: string[] }> {
  const results = await Promise.allSettled(
    tokens.map((token) => sendPushToToken({ ...payload, token })),
  );

  let sent = 0;
  let failed = 0;
  const expiredTokens: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled" && result.value.sent) {
      sent++;
    } else {
      failed++;
      const val = result.status === "fulfilled" ? result.value : null;
      if ((val as any)?.expired) expiredTokens.push(tokens[i]);
    }
  });

  return { sent, failed, expiredTokens };
}
