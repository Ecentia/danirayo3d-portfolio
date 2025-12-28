// --- firebase-config.js ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnvq0rAVq-MC9sprGpjZFSXNRYMsIZS2s",
  authDomain: "ejercicios-java-1854c.firebaseapp.com",
  projectId: "ejercicios-java-1854c",
  storageBucket: "ejercicios-java-1854c.firebasestorage.app",
  messagingSenderId: "167401298446",
  appId: "1:167401298446:web:fac4ad77d62098d1543a5f",
  measurementId: "G-1VBNP3DXB9"
};

// Inicializamos y exportamos para usar en los otros archivos
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);