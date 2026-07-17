import '@react-native-firebase/app';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

let _authInstance: FirebaseAuthTypes.Module | null = null;
let _firestoreInstance: FirebaseFirestoreTypes.Module | null = null;

export function getAuth(): FirebaseAuthTypes.Module {
  if (!_authInstance) {
    const mod = require('@react-native-firebase/auth');
    _authInstance = mod.default();
  }
  return _authInstance!;
}

export function getDb(): FirebaseFirestoreTypes.Module {
  if (!_firestoreInstance) {
    const mod = require('@react-native-firebase/firestore');
    _firestoreInstance = mod.default();
  }
  return _firestoreInstance!;
}

export const USERS_COLLECTION = 'users';
