// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv70k3MluH4g9vj_F2xpDi44bXd6qqnOI",
  authDomain: "testing-24171.firebaseapp.com",
  projectId: "testing-24171",
  storageBucket: "testing-24171.appspot.com",
  messagingSenderId: "298436751112",
  appId: "1:298436751112:web:853be53779327800ca46bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
