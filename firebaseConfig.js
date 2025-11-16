import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCK3OoYwWpIlJAs8E-HgpGaoYcvERRrieo",
  authDomain: "focuskinkbd.firebaseapp.com",
  projectId: "focuskinkbd",
  storageBucket: "focuskinkbd.firebasestorage.app",
  messagingSenderId: "92481632322",
  appId: "1:92481632322:web:9f638aef95af13be98d5db",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
