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
  const [resetPasswordData, setResetPasswordData] = useState(null)


  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = authService.getToken()
        if (token) {

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


  const requestVerificationCode = async (phoneNumber) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.requestVerificationCode(phoneNumber)

      console.log("==== VERIFICATION CODE REQUEST ====")
      console.log(`Phone Number: ${phoneNumber}`)
      console.log(`Verification Code: ${data.verificationCode}`)
      console.log(`Session Info: ${data.sessionInfo}`)
      console.log(`Request Time: ${new Date().toISOString()}`)
      console.log("=================================")

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


  const verifyPhoneNumber = async (code) => {
    try {
      if (!verificationData) {
        throw new Error("Verification data not found")
      }

      setLoading(true)
      setError(null)


      console.log("==== VERIFICATION ATTEMPT ====")
      console.log(`Phone Number: ${verificationData.phoneNumber}`)
      console.log(`User Entered Code: ${code}`)
      console.log(`Expected Code: ${verificationData.verificationCode}`)
      console.log("==============================")

      const data = await authService.verifyPhoneNumber(verificationData.sessionInfo, code, verificationData.phoneNumber)

   
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


  const requestPasswordReset = async (phoneNumber) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.requestPasswordResetCode(phoneNumber)

      console.log("==== PASSWORD RESET REQUEST ====")
      console.log(`Phone Number: ${phoneNumber}`)
      console.log(`Verification Code: ${data.verificationCode}`)
      console.log(`Session Info: ${data.sessionInfo}`)
      console.log(`Request Time: ${new Date().toISOString()}`)
      console.log("===============================")

      setResetPasswordData({
        sessionInfo: data.sessionInfo,
        verificationCode: data.verificationCode,
        phoneNumber: phoneNumber,
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
      console.log(`Phone Number: ${resetPasswordData.phoneNumber}`)
      console.log(`User Entered Code: ${code}`)
      console.log(`Session Info: ${resetPasswordData.sessionInfo}`)
      console.log("==================================")

      const data = await authService.verifyResetCode(resetPasswordData.sessionInfo, code, resetPasswordData.phoneNumber)


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
        verifyPhoneNumber,
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
