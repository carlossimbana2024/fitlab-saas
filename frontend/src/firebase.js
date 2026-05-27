import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDfxHa3ZXhPJSamcfjHyheIfr035nzoMiI",
    authDomain: "fitlab-saas-59643.firebaseapp.com",
    projectId: "fitlab-saas-59643",
    storageBucket: "fitlab-saas-59643.firebasestorage.app",
    messagingSenderId: "5418286583",
    appId: "1:5418286583:web:f7995d4f16d8c7f9dcc2f2"
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);