import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

try {
  admin.initializeApp({
    projectId: "hari-tva",
  });
} catch (error) {
  // Ignored if app is already initialized
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();

export async function verifyIdToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Token verification failed in Next.js server:", error);
    return null;
  }
}
