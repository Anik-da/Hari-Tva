import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5VrIsMxtu6CVkZZuJ-uHwOCO2jJBLLPw",
  authDomain: "hari-tva.firebaseapp.com",
  projectId: "hari-tva",
  storageBucket: "hari-tva.firebasestorage.app",
  messagingSenderId: "214962544036",
  appId: "1:214962544036:web:4cf1199b6c8c963f187531",
  measurementId: "G-KCZG2YPKQK"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
