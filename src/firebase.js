import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {                 //Todos estos datos se generar de manera automática en tu cuenta de Firebase
    apiKey: "Ingresa Tu API KEY",
    authDomain: "Tu dirección de auth en firebase",
    projectId: "Nombre de tu proyecto",
    storageBucket: "Nombre Bucket",
    messagingSenderId: "0",
    appId: "ID de Aplicacion"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
