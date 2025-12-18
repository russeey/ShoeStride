import { initializeApp } from "firebase/app"
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDYKWyguuNKlZSn33EfC17kwKQrUfMjBpM",
  authDomain: "shoestride-d887e.firebaseapp.com",
  projectId: "shoestride-d887e",
  storageBucket: "shoestride-d887e.appspot.com",
  messagingSenderId: "565377410555",
  appId: "1:565377410555:web:10a713788a90c4c659975e",
  measurementId: "G-BQRPJX6ZRF"
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

/* ✅ ADD THIS — DO NOT MOVE IT */
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Firebase auth persistence set to LOCAL")
  })
  .catch((error) => {
    console.error("❌ Auth persistence error:", error)
  })

const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }
