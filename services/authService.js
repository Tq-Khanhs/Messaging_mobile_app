import api from "./api"


let authToken = null


export const authService = {
  
  requestVerificationCode: async (phoneNumber) => {
    try {
      const response = await api.post("/auth/request-verification", { phoneNumber });
      if (response.data && response.data.verificationCode) {
        console.log("\n==================================")
        console.log(" VERIFICATION CODE SENT SUCCESSFULLY")
        console.log(` Phone: ${phoneNumber}`)
        console.log(` Code: ${response.data.verificationCode}`)
        console.log("==================================\n")
      }
      return response.data
    } catch (error) {
      console.error("Request verification code error:", error)
      throw error
    }
  },

  
  verifyPhoneNumber: async (sessionInfo, code, phoneNumber) => {
    try {
      const response = await api.post("/auth/verify-phone", {
        sessionInfo,
        code,
        phoneNumber,
      })
      return response.data
    } catch (error) {
      console.error("Verify phone number error:", error)
      throw error
    }
  },


  completeRegistration: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)


      if (response.data.token) {
        authToken = response.data.token
      }

      return response.data
    } catch (error) {
      console.error("Complete registration error:", error)
      throw error
    }
  },


  login: async (phoneNumber, password) => {
    try {
      const response = await api.post("/auth/login", { phoneNumber, password })

      if (response.data.token) {
        authToken = response.data.token
      }

      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  requestPasswordReset: async (phoneNumber) => {
    try {
      const response = await api.post("/auth/request-password-reset", { phoneNumber })
      return response.data
    } catch (error) {
      console.error("Request password reset error:", error)
      throw error
    }
  },


  resetPassword: async (sessionInfo, code, phoneNumber, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        sessionInfo,
        code,
        phoneNumber,
        newPassword,
      })
      return response.data
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  },


  logout: async () => {
    try {
      authToken = null
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  },


  getToken: () => {
    return authToken
  },
}

