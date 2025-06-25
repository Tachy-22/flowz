import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, firestore } from "./config";

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface UserProfile extends User {
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: "light" | "dark" | "system";
    autoSave: boolean;
    autoSaveInterval: number;
    language: string;
  };
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Twitter Auth Provider
const twitterProvider = new TwitterAuthProvider();

// Convert Firebase User to our User interface
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
});

// Create user profile in Firestore
const createUserProfile = async (user: User): Promise<void> => {
  const userRef = doc(firestore, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const userProfile: Omit<
      UserProfile,
      "uid" | "email" | "displayName" | "photoURL" | "emailVerified"
    > = {
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        theme: "system",
        autoSave: true,
        autoSaveInterval: 30000,
        language: "en",
      },
    };

    await setDoc(userRef, {
      ...user,
      ...userProfile,
      createdAt: Timestamp.fromDate(userProfile.createdAt),
      lastLoginAt: Timestamp.fromDate(userProfile.lastLoginAt),
    });
  } else {
    // Update last login time
    await setDoc(
      userRef,
      {
        lastLoginAt: Timestamp.fromDate(new Date()),
      },
      { merge: true }
    );
  }
};

// Authentication functions
export const authService = {
  // Register with email and password
  registerWithEmailAndPassword: async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> => {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Send email verification
      await sendEmailVerification(userCredential.user);

      const user = convertFirebaseUser(userCredential.user);
      await createUserProfile(user);

      return user;
    } catch (error) {
      throw new Error(`Registration failed: ${(error as Error).message}`);
    }
  },

  // Sign in with email and password
  signInWithEmailAndPassword: async (
    email: string,
    password: string
  ): Promise<User> => {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = convertFirebaseUser(userCredential.user);
      await createUserProfile(user);

      return user;
    } catch (error) {
      throw new Error(`Sign in failed: ${(error as Error).message}`);
    }
  },
  // Sign in with Google
  signInWithGoogle: async (): Promise<User> => {
    try {
      const userCredential: UserCredential = await signInWithPopup(
        auth,
        googleProvider
      );
      const user = convertFirebaseUser(userCredential.user);
      await createUserProfile(user);

      return user;
    } catch (error) {
      throw new Error(`Google sign in failed: ${(error as Error).message}`);
    }
  },

  // Sign in with Twitter
  signInWithTwitter: async (): Promise<User> => {
    try {
      const userCredential: UserCredential = await signInWithPopup(
        auth,
        twitterProvider
      );
      const user = convertFirebaseUser(userCredential.user);
      await createUserProfile(user);

      return user;
    } catch (error) {
      throw new Error(`Twitter sign in failed: ${(error as Error).message}`);
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(`Sign out failed: ${(error as Error).message}`);
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(`Password reset failed: ${(error as Error).message}`);
    }
  },

  // Resend email verification
  resendEmailVerification: async (): Promise<void> => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error) {
        throw new Error(
          `Email verification failed: ${(error as Error).message}`
        );
      }
    } else {
      throw new Error("No user is currently signed in");
    }
  },

  // Update user profile
  updateUserProfile: async (updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, updates);

        // Update in Firestore as well
        const userRef = doc(firestore, "users", auth.currentUser.uid);
        await setDoc(userRef, updates, { merge: true });
      } catch (error) {
        throw new Error(`Profile update failed: ${(error as Error).message}`);
      }
    } else {
      throw new Error("No user is currently signed in");
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser ? convertFirebaseUser(auth.currentUser) : null;
  },

  // Subscribe to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? convertFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  },

  // Get user profile from Firestore
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(firestore, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          emailVerified: data.emailVerified,
          createdAt: data.createdAt.toDate(),
          lastLoginAt: data.lastLoginAt.toDate(),
          preferences: data.preferences,
        };
      }

      return null;
    } catch (error) {
      throw new Error(
        `Failed to get user profile: ${(error as Error).message}`
      );
    }
  },

  // Update user preferences
  updateUserPreferences: async (
    uid: string,
    preferences: Partial<UserProfile["preferences"]>
  ): Promise<void> => {
    try {
      const userRef = doc(firestore, "users", uid);
      await setDoc(
        userRef,
        {
          preferences,
        },
        { merge: true }
      );
    } catch (error) {
      throw new Error(
        `Failed to update preferences: ${(error as Error).message}`
      );
    }
  },
};
