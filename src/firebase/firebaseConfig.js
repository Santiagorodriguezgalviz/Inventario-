import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA-KvFMhLaUE0PNvXrU0SZPHwn3IkOwQ-s",
  authDomain: "inventario-2a78d.firebaseapp.com",
  projectId: "inventario-2a78d",
  storageBucket: "inventario-2a78d.appspot.com",
  messagingSenderId: "986493636150",
  appId: "1:986493636150:web:7779c06a87b18da3d6d297"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);