import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 설정 확인
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase 환경변수가 설정되었는지 확인
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let db = null;

// Firebase가 설정된 경우에만 초기화
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase 실시간 동기화 활성화');
  } catch (error) {
    console.warn('⚠️ Firebase 초기화 실패, API 모드로 전환:', error);
  }
} else {
  console.warn('⚠️ Firebase 환경변수 미설정, API 모드로 작동');
}

export { db, isFirebaseConfigured };
