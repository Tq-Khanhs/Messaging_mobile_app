"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { authService } from "../services/authService"
import { userService } from "../services/userService"

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verificationData, setVerificationData] = useState(null)

  // Check if user is logged in on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = authService.getToken()
        if (token) {
          // Get user profile if token exists
          const userData = await userService.getUserProfile()
          setUser(userData.user)
        }
      } catch (err) {
        console.error("Auth check error:", err)
      } finally {
        setLoading(false)
      }
    }

    checkLoginStatus()
  }, [])

  // Request verification code
  const requestVerificationCode = async (phoneNumber) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.requestVerificationCode(phoneNumber)
      setVerificationData({
        sessionInfo: data.sessionInfo,
        verificationCode: data.verificationCode,
        phoneNumber: data.phoneNumber,
      })
      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request verification code")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Verify phone number
  const verifyPhoneNumber = async (code) => {
    try {
      if (!verificationData) {
        throw new Error("Verification data not found")
      }

      setLoading(true)
      setError(null)

      const data = await authService.verifyPhoneNumber(verificationData.sessionInfo, code, verificationData.phoneNumber)

      // Update verification data with firebase UID
      setVerificationData({
        ...verificationData,
        firebaseUid: data.firebaseUid,
        tempToken: data.tempToken,
      })

      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify phone number")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Complete registration
  const register = async (userData) => {
    try {
      if (!verificationData || !verificationData.firebaseUid) {
        throw new Error("Verification not completed")
      }

      setLoading(true)
      setError(null)

      const data = await authService.completeRegistration({
        ...userData,
        phoneNumber: verificationData.phoneNumber,
        firebaseUid: verificationData.firebaseUid,
      })

      setUser(data.user)
      return data
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Login
  const login = async (phoneNumber, password) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.login(phoneNumber, password)
      setUser(data.user)
      return data
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Request password reset
  const requestPasswordReset = async (phoneNumber) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.requestPasswordReset(phoneNumber)
      setVerificationData({
        sessionInfo: data.sessionInfo,
        verificationCode: data.verificationCode,
        phoneNumber: phoneNumber,
      })
      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request password reset")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (code, newPassword) => {
    try {
      if (!verificationData) {
        throw new Error("Verification data not found")
      }

      setLoading(true)
      setError(null)

      const data = await authService.resetPassword(
        verificationData.sessionInfo,
        code,
        verificationData.phoneNumber,
        newPassword,
      )

      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
    } catch (err) {
      setError(err.message || "Logout failed")
    } finally {
      setLoading(false)
    }
  }

  // Clear verification data
  const clearVerificationData = () => {
    setVerificationData(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        verificationData,
        requestVerificationCode,
        verifyPhoneNumber,
        register,
        login,
        requestPasswordReset,
        resetPassword,
        logout,
        clearVerificationData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

