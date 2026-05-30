import { createContext, useContext, useState, useEffect } from 'react'
import { auth, signInWithPopup, googleProvider, signInWithPhoneNumber } from '../config/firebase'
import { api } from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('firebaseToken'))

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('firebaseToken')
      if (storedToken) {
        const data = await api.login(storedToken)
        setUser(data.user)
        setProfile(data.profile)
        setToken(storedToken)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('firebaseToken')
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      localStorage.setItem('firebaseToken', idToken)
      
      const data = await api.login(idToken)
      setUser(data.user)
      setProfile(data.profile)
      setToken(idToken)
      
      return { success: true, hasProfile: data.hasProfile }
    } catch (error) {
      console.error('Google login error:', error)
      return { success: false, error: error.message }
    }
  }

  const loginWithPhone = async (phoneNumber, recaptchaVerifier) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      return { success: true, confirmationResult }
    } catch (error) {
      console.error('Phone login error:', error)
      return { success: false, error: error.message }
    }
  }

  const verifyPhoneCode = async (confirmationResult, code) => {
    try {
      const result = await confirmationResult.confirm(code)
      const idToken = await result.user.getIdToken()
      localStorage.setItem('firebaseToken', idToken)
      
      const data = await api.login(idToken)
      setUser(data.user)
      setProfile(data.profile)
      setToken(idToken)
      
      return { success: true, hasProfile: data.hasProfile }
    } catch (error) {
      console.error('Code verification error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await auth.signOut()
      localStorage.removeItem('firebaseToken')
      setUser(null)
      setProfile(null)
      setToken(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = (newProfile) => {
    setProfile(newProfile)
  }

  const value = {
    user,
    profile,
    loading,
    token,
    loginWithGoogle,
    loginWithPhone,
    verifyPhoneCode,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
