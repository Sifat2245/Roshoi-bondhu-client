import React, { createContext, useEffect, useState } from 'react';
import { app } from '../firebase/firebase_init';
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from "firebase/auth";

export const AuthContext = createContext();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start true until first auth check
    const [authError, setAuthError] = useState(null);

    const clearError = () => setAuthError(null);

    const createUserAccount = (email, password, name, profileImage) => {
        setLoading(true);
        setAuthError(null);
        return createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                return updateProfile(userCredential.user, {
                    displayName: name,
                    photoURL: profileImage || null // Pass null if profileImage is empty
                }).then(() => {
                    // Firebase onAuthStateChanged will trigger setUser with the updated info
                    // However, to get immediate feedback, we can manually update parts of it
                    setUser(auth.currentUser); // Re-fetch current user which should have updated profile
                    setLoading(false);
                    return userCredential;
                }).catch(error => {
                    setAuthError(`Profile update error: ${error.message}`);
                    setLoading(false);
                    throw error;
                });
            })
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    const loginUser = (email, password) => {
        setLoading(true);
        setAuthError(null);
        return signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                setUser(userCredential.user);
                setLoading(false);
                return userCredential;
            })
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    const loginWithGoogle = () => {
        setLoading(true);
        setAuthError(null);
        return signInWithPopup(auth, googleProvider)
            .then(result => {
                setUser(result.user);
                setLoading(false);
                return result;
            })
            .catch(error => {
                setAuthError(error.code === 'auth/popup-closed-by-user' ? null : error.message); // Don't set error if user closes popup
                setLoading(false);
                if (error.code !== 'auth/popup-closed-by-user') {
                    throw error;
                }
            });
    };

    const passwordReset = (email) => {
        setLoading(true);
        setAuthError(null);
        return sendPasswordResetEmail(auth, email)
            .then(() => {
                setLoading(false);
            })
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    const logoutUser = () => {
        setLoading(true);
        setAuthError(null);
        return signOut(auth)
            .then(() => {
                setUser(null);
                setLoading(false);
            })
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            setAuthError(null); // Clear any lingering auth errors on user state change
        });
        return () => unsubscribe();
    }, []);

    const authData = {
        user,
        loading,
        authError,
        setAuthError, // Allow manually clearing/setting error
        clearError,
        createUserAccount,
        loginUser,
        loginWithGoogle,
        passwordReset,
        logoutUser
    };

    return <AuthContext.Provider value={authData}>
        {children}
    </AuthContext.Provider>;
};

export default AuthProvider;