import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserRole = 'member' | 'librarian' | 'admin';

interface AppUser extends FirebaseUser {
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const provider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            setUser({ ...firebaseUser, role: userDoc.data().role } as AppUser);
          } else {
            // Initialize new user as member
            // EXCEPT if it matches the bootstrapped admin email
            // Google/Firebase report emails in lowercase, so compare case-insensitively.
            const isAdmin = firebaseUser.email?.toLowerCase() === 'makilivelink@gmail.com';
            const role: UserRole = isAdmin ? 'admin' : 'member';

            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role,
              createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser({ ...firebaseUser, role } as AppUser);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        // Google sign-in worked but reading/creating the Firestore profile failed
        // (e.g. the deployed security rules deny it). Previously this rejection was
        // unhandled, leaving the login screen (or the loading screen after a reload)
        // up with no feedback.
        console.error('Failed to load user profile:', err);
        setError(`Signed in with Google, but your library profile couldn't be loaded: ${(err as Error).message}`);
        setUser(null);
        // Sign out so the next sign-in attempt triggers a fresh auth state change.
        signOut(auth).catch(() => {});
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
      const code = (error as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user') {
        setError('The Google sign-in window closed before sign-in finished. Please try again.');
      } else if (code !== 'auth/cancelled-popup-request') {
        // cancelled-popup-request only means a newer popup replaced this one (e.g. a double click).
        setError(`Google sign-in failed: ${(error as Error).message}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
