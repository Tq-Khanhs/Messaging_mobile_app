"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { authService } from "../services/authService"
import { userService } from "../services/userService"
import socketService from "../services/socketService"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verificationData, setVerificationData] = useState(null)
  const [resetPasswordData, setResetPasswordData] = useState(null)

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = authService.getToken()
        if (token) {
          const userData = await userService.getUserProfile()
          setUser(userData.user)

          // Initialize socket connection if user is already logged in
          console.log("[AuthContext] User already logged in, initializing socket connection")
          await socketService.init()
        }
      } catch (err) {
        console.error("Auth check error:", err)
      } finally {
        setLoading(false)
      }
    }

    checkLoginStatus()
  }, [])

  const requestVerificationCode = async (email) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.requestVerificationCode(email)

      console.log("==== VERIFICATION CODE REQUEST ====")
      console.log(`Email: ${email}`)
      console.log(`Verification Code: ${data.verificationCode}`)
      console.log(`Session Info: ${data.sessionInfo}`)
      console.log(`Request Time: ${new Date().toISOString()}`)
      console.log("=================================")

      setVerificationData({
        sessionInfo: data.sessionInfo,
        verificationCode: data.verificationCode,
        email: data.email || email,
      })
      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request verification code")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (code) => {
    try {
      if (!verificationData) {
        throw new Error("Verification data not found")
      }

      setLoading(true)
      setError(null)

      console.log("==== VERIFICATION ATTEMPT ====")
      console.log(`Email: ${verificationData.email}`)
      console.log(`User Entered Code: ${code}`)
      console.log(`Expected Code: ${verificationData.verificationCode}`)
      console.log("==============================")

      const data = await authService.verifyEmail(verificationData.sessionInfo, code, verificationData.email)

      setVerificationData({
        ...verificationData,
        userId: data.userId,
        tempToken: data.tempToken,
      })

      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      if (!verificationData || !verificationData.userId) {
        throw new Error("Verification not completed")
      }

      setLoading(true)
      setError(null)

      const data = await authService.completeRegistration({
        ...userData,
        email: verificationData.email,
        userId: verificationData.userId,
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

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.login(email, password)
      setUser(data.user)

      // Initialize socket connection after successful login
      try {
        await socketService.init()
        console.log("[AuthContext] Socket initialized after login")
      } catch (socketErr) {
        console.error("[AuthContext] Error initializing socket after login:", socketErr)
        // Don't fail the login if socket fails to connect
      }

      return data
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.requestPasswordResetCode(email)

      console.log("==== PASSWORD RESET REQUEST ====")
      console.log(`Email: ${email}`)
      console.log(`Verification Code: ${data.verificationCode}`)
      console.log(`Session Info: ${data.sessionInfo}`)
      console.log(`Request Time: ${new Date().toISOString()}`)
      console.log("===============================")

      setResetPasswordData({
        sessionInfo: data.sessionInfo,
        verificationCode: data.verificationCode,
        email: email,
        requestTime: new Date().getTime(),
      })
      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request password reset")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyResetCode = async (code) => {
    try {
      if (!resetPasswordData) {
        throw new Error("Reset password data not found")
      }

      setLoading(true)
      setError(null)

      console.log("==== VERIFY RESET CODE ATTEMPT ====")
      console.log(`Email: ${resetPasswordData.email}`)
      console.log(`User Entered Code: ${code}`)
      console.log(`Session Info: ${resetPasswordData.sessionInfo}`)
      console.log("==================================")

      const data = await authService.verifyResetCode(resetPasswordData.sessionInfo, code, resetPasswordData.email)

      setResetPasswordData({
        ...resetPasswordData,
        resetToken: data.resetToken,
        userId: data.userId,
        verified: true,
      })

      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify reset code")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completePasswordReset = async (newPassword) => {
    try {
      if (!resetPasswordData || !resetPasswordData.resetToken) {
        throw new Error("Reset token not found")
      }

      setLoading(true)
      setError(null)

      console.log("==== COMPLETE PASSWORD RESET ====")
      console.log(`Reset Token: ${resetPasswordData.resetToken.substring(0, 10)}...`)
      console.log(`Password Length: ${newPassword.length}`)
      console.log("=================================")

      const data = await authService.completePasswordReset(resetPasswordData.resetToken, newPassword)

      clearResetPasswordData()

      return data
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password")
      throw err
    } finally {
      setLoading(false)
    }
  }

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

  const clearVerificationData = () => {
    setVerificationData(null)
  }

  const clearResetPasswordData = () => {
    setResetPasswordData(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        verificationData,
        resetPasswordData,
        requestVerificationCode,
        verifyEmail,
        register,
        login,
        requestPasswordReset,
        verifyResetCode,
        completePasswordReset,
        logout,
        clearVerificationData,
        clearResetPasswordData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
