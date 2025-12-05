// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDAYehaSMN_qOWbpKgIEfD24yK6YGjiP6E",
  authDomain: "astrromathpattern.firebaseapp.com",
  projectId: "astrromathpattern",
  storageBucket: "astrromathpattern.firebasestorage.app",
  messagingSenderId: "603838220658",
  appId: "1:603838220658:web:833b7aa7b5f7bafb75b5eb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fireDB = getFirestore(app);
const auth = getAuth(app);

export { fireDB, auth };
