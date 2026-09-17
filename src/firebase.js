import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMcNcko4jYEZPCQgxF62Rbscmj7Jvg4A8",
  authDomain: "event-budget-tracker.firebaseapp.com",
  projectId: "event-budget-tracker",
  storageBucket: "event-budget-tracker.firebasestorage.app",
  messagingSenderId: "652577315923",
  appId: "1:652577315923:web:2261f9368c310af332faa6",
  measurementId: "G-YBF0F1XFTK"
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID !== "your_project_id"
);

let app = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed, using local storage mode:", error);
  }
}

export { db };
