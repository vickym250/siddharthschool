// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // 👈 Ye missing tha


const firebaseConfig = {
  apiKey: "AIzaSyBwgDVb1xPO0LWjbrdXA0KAL7atO-zmz_0",
  authDomain: "siddhart-school.firebaseapp.com",
  projectId: "siddhart-school",
  storageBucket: "siddhart-school.firebasestorage.app",
  messagingSenderId: "284823213244",
  appId: "1:284823213244:web:baf7df7430c5094635ecb9",
  measurementId: "G-6GPCQFEL3S"
};

const app = initializeApp(firebaseConfig);

// 👇 Teeno cheezein export karni zaroori hain
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app); // 👈 Isko add kiya