import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAm0i_oAMvHUGj29XuHz5mkh97EZEuMqQg",
    authDomain: "sistema-convenios-6dfc7.firebaseapp.com",
    projectId: "sistema-convenios-6dfc7",
    storageBucket: "sistema-convenios-6dfc7.firebasestorage.app",
    messagingSenderId: "70564510180",
    appId: "1:70564510180:web:cce5c9d7ad091b5c596ff1"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };