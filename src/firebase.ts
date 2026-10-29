import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBWfKwuZrZTEUdzXuiU1-Tz3XACYmHD66I",
  authDomain: "mathiparan-d8c1c.firebaseapp.com",
  databaseURL: "https://mathiparan-d8c1c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mathiparan-d8c1c",
  storageBucket: "mathiparan-d8c1c.firebasestorage.app",
  messagingSenderId: "917893032477",
  appId: "1:917893032477:web:982b59f0a7e8a59b9cb4f4",
  measurementId: "G-TL54332H0S"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
