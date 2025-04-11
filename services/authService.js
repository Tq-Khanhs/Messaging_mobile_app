import api from "./api"

// Store token in memory for now
let authToken = null

// Auth API services
export const authService = {
  // Request verification code
  requestVerificationCode: async (email) => {
    try {
      console.log(`Requesting verification code for: ${email}`)
      const response = await api.post("/auth/request-verification", {
        email,
      })

      // For development/testing: Log the verification code
      if (response.data && response.data.verificationCode) {
        console.log(`[DEV] Verification code for ${email}: ${response.data.verificationCode}`)
      }

      return response.data
    } catch (error) {
      console.error("Request verification code error:", error)
      throw error
    }
  },

  // Verify email
  verifyEmail: async (sessionInfo, code, email) => {
    try {
      const response = await api.post("/auth/verify-email", {
        sessionInfo,
        code,
        email,
      })
      return response.data
    } catch (error) {
      console.error("Verify email error:", error)
      throw error
    }
  },

  // Complete registration
  completeRegistration: async (userData) => {
    try {
      // Log the userData being sent to the API
      console.log("Completing registration with data:", {
        email: userData.email,
        fullName: userData.fullName,
        birthdate: userData.birthdate,
        gender: userData.gender,
        userId: userData.userId,
        hasAvatar: !!userData.avatarUrl,
        avatarUrl: userData.avatarUrl,
      })

      const response = await api.post("/auth/register", userData)

      // Store token in memory
      if (response.data.token) {
        authToken = response.data.token
      }

      // Log the response from the API
      console.log("Registration response:", {
        success: !!response.data.user,
        userId: response.data.user?.id,
        hasToken: !!response.data.token,
        hasAvatar: !!response.data.user?.avatarUrl,
      })

      return response.data
    } catch (error) {
      console.error("Complete registration error:", error)
      throw error
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      })

      // Store token in memory
      if (response.data.token) {
        authToken = response.data.token
      }

      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // STEP 1: Request password reset code
  requestPasswordResetCode: async (email) => {
    try {
      console.log(`Requesting password reset code for: ${email}`)
      const response = await api.post("/auth/request-password-reset-code", {
        email,
      })

      // For development/testing: Log the verification code
      if (response.data && response.data.verificationCode) {
        console.log(`[DEV] Password reset code for ${email}: ${response.data.verificationCode}`)
      }

      return response.data
    } catch (error) {
      console.error("Request password reset code error:", error)
      throw error
    }
  },

  // STEP 2: Verify reset code
  verifyResetCode: async (sessionInfo, code, email) => {
    try {
      console.log("Verifying password reset code:", {
        sessionInfo,
        code,
        email,
      })

      const response = await api.post("/auth/verify-reset-code", {
        sessionInfo: String(sessionInfo),
        code: String(code),
        email: String(email),
      })

      console.log("Verify reset code response:", response.status, response.data)
      return response.data
    } catch (error) {
      console.error("Verify reset code error:", error)
      console.error("Error response data:", error.response?.data)
      console.error("Error status:", error.response?.status)
      throw error
    }
  },

  // STEP 3: Complete password reset
  completePasswordReset: async (resetToken, newPassword) => {
    try {
      console.log("Completing password reset with token:", resetToken?.substring(0, 10) + "...")

      const response = await api.post("/auth/complete-password-reset", {
        resetToken: String(resetToken),
        newPassword: String(newPassword),
      })

      console.log("Complete password reset response:", response.status)
      return response.data
    } catch (error) {
      console.error("Complete password reset error:", error)
      console.error("Error response data:", error.response?.data)
      console.error("Error status:", error.response?.status)
      throw error
    }
  },

  // Logout
  logout: async () => {
    try {
      authToken = null
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },

  // Get token
  getToken: () => {
    return authToken
  },
}
