import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHpOSn_OSkOhn293UlwY8r-N-Y0VHiKQE",
  authDomain: "fivefood-datn-8a1cf.firebaseapp.com",
  projectId: "fivefood-datn-8a1cf",
  storageBucket: "fivefood-datn-8a1cf.appspot.com",
  messagingSenderId: "698985592360",
  appId: "G-K1RS08FD85"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const db = getFirestore(app);

export { storage,db };