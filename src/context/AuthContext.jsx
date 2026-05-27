import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function register(email, password, profileData) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: profileData.fullName })

    // Save full profile to Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email,
      fullName: profileData.fullName,
      phone: profileData.phone || '',
      location: profileData.location || '',
      disabilityType: profileData.disabilityType,
      comfortableWith: profileData.comfortableWith || [],
      assignedTracks: profileData.assignedTracks || [],
      role: 'user',
      totalEarnings: 0,
      completedModules: [],
      certificates: [],
      createdAt: serverTimestamp(),
    })
    return result
  }

  async function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    // Check if profile exists, if not create a basic one
    const profileDoc = await getDoc(doc(db, 'users', result.user.uid))
    if (!profileDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        fullName: result.user.displayName || '',
        phone: '',
        location: '',
        disabilityType: '',
        comfortableWith: [],
        assignedTracks: [],
        role: 'user',
        totalEarnings: 0,
        completedModules: [],
        certificates: [],
        createdAt: serverTimestamp(),
        needsProfileCompletion: true,
      })
    }
    return result
  }

  async function logout() {
    await signOut(auth)
    setUserProfile(null)
  }

  async function fetchUserProfile(uid) {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      setUserProfile(docSnap.data())
      return docSnap.data()
    }
    return null
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    loginWithEmail,
    loginWithGoogle,
    logout,
    fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
