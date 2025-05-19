
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4mhqWE-iG08bWGEtID_uzQq6MK7sXQfw",
  authDomain: "medicare-4e776.firebaseapp.com",
  projectId: "medicare-4e776",
  storageBucket: "medicare-4e776.appspot.com",
  messagingSenderId: "508001511774",
  appId: "1:508001511774:web:337c8d0cf062013a6547cf",
  measurementId: "G-6Y6Q4DNEC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Configure Google Auth Provider
provider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, provider };