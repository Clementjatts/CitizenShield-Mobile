import { initializeApp, FirebaseOptions } from 'firebase/app';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const androidConfig: FirebaseOptions = {
    apiKey: "AIzaSyDV_Gj_bUIuOlusxg56-0dt9A-cjfGVqfs",
    authDomain: "citizenshield-78464.firebaseapp.com",
    projectId: "citizenshield-78464",
    storageBucket: "citizenshield-78464.appspot.com",
    messagingSenderId: "362496878607",
    appId: "1:362496878607:android:711ad1cbddda4e8d591b7a"
};

const iosConfig: FirebaseOptions = {
    apiKey: "AIzaSyC5IfQC78vuU3AZAJMzTup8Ksscij9-mrs",
    authDomain: "citizenshield-78464.firebaseapp.com",
    projectId: "citizenshield-78464",
    storageBucket: "citizenshield-78464.appspot.com",
    messagingSenderId: "362496878607",
    appId: "1:362496878607:ios:b9f4b42dd1b34e34591b7a"
};

const firebaseConfig = Platform.OS === 'ios' ? iosConfig : androidConfig;

const app = initializeApp(firebaseConfig);

// Initialize Auth with inMemory persistence
const auth = initializeAuth(app, {
    persistence: inMemoryPersistence
});

// Attempt to clear any existing auth state when the app starts
auth.signOut().catch(error => console.log('SignOut error:', error));

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);