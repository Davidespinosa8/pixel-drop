// Este módulo solo debe importarse en código server-side (Route Handlers, Server Components).
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let _app: App | undefined;
let _auth: Auth | undefined;

function getAdminApp(): App {
  if (_app) return _app;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured.");
  }

  _app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return _app;
}

export function getAdminAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getAdminApp());
  }
  return _auth;
}
