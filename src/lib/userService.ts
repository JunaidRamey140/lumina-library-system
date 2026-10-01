import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { UserRole } from '../contexts/AuthContext';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export const userService = {
  async getAllUsers() {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  },

  async updateUserRole(uid: string, role: UserRole) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
  }
};
