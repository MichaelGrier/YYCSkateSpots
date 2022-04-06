import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBxf1LgxqIbjQpdUbT5uParR0YJEt5mfH4',
  authDomain: 'yycskatespots-2fcd8.firebaseapp.com',
  projectId: 'yycskatespots-2fcd8',
  storageBucket: 'yycskatespots-2fcd8.appspot.com',
  messagingSenderId: '773580731036',
  appId: '1:773580731036:web:9d1d95044f0d27c9d77359',
  measurementId: 'G-V9D7ERGP05',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
