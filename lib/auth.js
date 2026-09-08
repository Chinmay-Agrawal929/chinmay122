import { betterAuth } from "better-auth";
import { firestoreAdapter } from "better-auth-firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins"; // Added twoFactor plugin

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || "demo-DWASFW-rec";
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const appOptions = { projectId: firebaseProjectId };
if (firebaseClientEmail && firebasePrivateKey && !firebasePrivateKey.includes("YOUR_PRIVATE_KEY_HERE")) {
  appOptions.credential = cert({
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    privateKey: firebasePrivateKey,
  });
} else {
  // If no valid credentials, set the emulator host to prevent GoogleAuth crash during local development
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
}

const app = getApps().length > 0 ? getApps()[0] : initializeApp(appOptions);
const firestore = getFirestore(app);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  database: firestoreAdapter({
    firestore,
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (reduces re-login and session creation writes)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
    updateAge: 60 * 60 * 24, // 1 day (prevent frequent session writes)
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Require email verification before allowing login
    async sendResetPassword(data, request) {
      // In a real app, you would send an email here using a service like Resend, SendGrid, etc.
      console.log("\n========================================================");
      console.log(`[AUTH] Password Reset Requested for: ${data.user.email}`);
      console.log(`[AUTH] Reset Link: ${data.url}`);
      console.log("========================================================\n");
    },
    async sendVerificationEmail(data, request) {
      // In a real app, you would send an email here using a service like Resend, SendGrid, etc.
      console.log("\n========================================================");
      console.log(`[AUTH] Email Verification Requested for: ${data.user.email}`);
      console.log(`[AUTH] Verification Link: ${data.url}`);
      console.log("========================================================\n");
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    twoFactor({
      otpOptions: {
        issuer: "Recruitment 2026", // The name that will appear in the Authenticator app
      }
    }),
    nextCookies(), // This must be the last plugin in the array
  ],
});