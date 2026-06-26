// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcDc6MBQ1y__6PvLzg5SwL-p4czZ9x7Fk",
  authDomain: "project-7815240681674914956.firebaseapp.com",
  projectId: "project-7815240681674914956",
  storageBucket: "project-7815240681674914956.firebasestorage.app",
  messagingSenderId: "848465436323",
  appId: "1:848465436323:web:e9fa73c5834165b82fe916",
  measurementId: "G-VZBNH8GWRG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn("Firebase Analytics could not be initialized, likely due to standard iframe cookie restrictions:", err);
  }
}

export { analytics };
