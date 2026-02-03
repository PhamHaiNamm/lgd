import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDVQtDzWwEQvMSonmbg6b3SZTXU05M4htQ",
    authDomain: "luc-gia-duong.firebaseapp.com",
    projectId: "luc-gia-duong",
    storageBucket: "luc-gia-duong.firebasestorage.app",
    messagingSenderId: "29057713380",
    appId: "1:29057713380:web:d7c54e4f7296a6ed1518f1",
    measurementId: "G-FTWPZH0RWZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);