import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDfxHa3ZXhPJSamcfjHyheIfr035nzoMiI",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "fitlab-saas-59643.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "fitlab-saas-59643",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "fitlab-saas-59643.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "5418286583",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:5418286583:web:f7995d4f16d8c7f9dcc2f2",
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
