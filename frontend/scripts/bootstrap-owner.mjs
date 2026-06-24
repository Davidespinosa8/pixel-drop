/**
 * bootstrap-owner.mjs
 *
 * Asigna el rol "owner" al propietario de la aplicación en Firebase Authentication.
 * Ejecutar UNA VEZ antes del primer uso: npm run bootstrap:owner
 *
 * Requiere en .env.local:
 *   OWNER_EMAIL, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ownerEmail = process.env.OWNER_EMAIL?.trim();
if (!ownerEmail) {
  console.error("ERROR: OWNER_EMAIL no está configurado en .env.local");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("ERROR: Las credenciales de Firebase Admin no están configuradas en .env.local");
  process.exit(1);
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

const auth = getAuth(app);

try {
  let user;
  try {
    user = await auth.getUserByEmail(ownerEmail);
    console.log(`Usuario existente: ${user.uid} (${user.email})`);
  } catch {
    user = await auth.createUser({ email: ownerEmail, emailVerified: false });
    console.log(`Usuario creado: ${user.uid} (${user.email})`);
  }

  if (user.disabled) {
    console.error("ERROR: El usuario está deshabilitado en Firebase Authentication.");
    process.exit(1);
  }

  await auth.setCustomUserClaims(user.uid, { role: "owner" });
  console.log(`✓ Rol 'owner' asignado a ${ownerEmail} (uid: ${user.uid})`);
} catch (error) {
  console.error("ERROR al configurar el propietario:", error);
  process.exit(1);
}
