"use client"

import { createContext, useState, useEffect, useContext, useRef, useCallback } from "react"
import socketService from "../services/socketService"
import { useAuth } from "./AuthContext"
import { SOCKET_EVENTS } from "../config/constants"

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const { user, token } = useAuth()
  const initialized = useRef(false)
  const reconnectTimeoutRef = useRef(null)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) {
      console.log("[SocketContext] No user or token, skipping socket initialization")
      return
    }

    const initSocket = async () => {
      console.log("[SocketContext] Starting socket initialization")

      if (initialized.current) {
        console.log("[SocketContext] Socket already initialized, reconnecting")
        socketService.disconnect()
      }

      try {
        console.log("[SocketContext] Attempting to initialize socket")
        const success = await socketService.init()
        
        if (success) {
          console.log("[SocketContext] Socket initialized successfully")
          initialized.current = true
          setIsConnected(true)
          
          // Wait for connection to be fully established
          await new Promise((resolve) => {
            const checkConnection = () => {
              if (socketService.isConnected) {
                resolve()
              } else {
                setTimeout(checkConnection, 100)
              }
            }
            checkConnection()
          })
        } else {
          console.error("[SocketContext] Socket initialization failed")
          setIsConnected(false)
          scheduleReconnect()
        }
      } catch (err) {
        console.error("[SocketContext] Socket initialization error:", err)
        setIsConnected(false)
        scheduleReconnect()
      }

      // Set up connection status listeners
      const connectHandler = () => {
        console.log("[SocketContext] Socket connected")
        setIsConnected(true)
        // Clear any pending reconnect attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      const disconnectHandler = (reason) => {
        console.log("[SocketContext] Socket disconnected. Reason:", reason)
        setIsConnected(false)

        // Handle different disconnect reasons
        if (reason === "io server disconnect" || reason === "transport close") {
          // Server initiated disconnect or transport error
          scheduleReconnect()
        } else if (reason === "io client disconnect") {
          // Client initiated disconnect, don't reconnect
          console.log("[SocketContext] Client initiated disconnect, not reconnecting")
        }
      }

      const errorHandler = (error) => {
        console.error("[SocketContext] Socket error:", error)
        setIsConnected(false)
        
        // Handle authentication errors
        if (error.message?.includes("authentication")) {
          console.log("[SocketContext] Authentication error, clearing token")
          // Clear token and redirect to login
          // You'll need to implement this based on your auth system
        } else {
          // Other errors, attempt to reconnect
          scheduleReconnect()
        }
      }

      // Schedule reconnection attempt
      const scheduleReconnect = () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        
        reconnectTimeoutRef.current = setTimeout(async () => {
          if (user && token) {
            console.log("[SocketContext] Attempting to reconnect socket")
            try {
              const success = await socketService.init()
              if (!success) {
                console.error("[SocketContext] Reconnection failed")
                // If still not connected, schedule another attempt
                if (!socketService.isConnected) {
                  scheduleReconnect()
                }
              }
            } catch (err) {
              console.error("[SocketContext] Reconnection attempt failed:", err)
              // If still not connected, schedule another attempt
              if (!socketService.isConnected) {
                scheduleReconnect()
              }
            }
          }
        }, reconnectDelay)
      }

      // Register event listeners
      socketService.on(SOCKET_EVENTS.CONNECT, "context", connectHandler)
      socketService.on(SOCKET_EVENTS.DISCONNECT, "context", disconnectHandler)
      socketService.on(SOCKET_EVENTS.ERROR, "context", errorHandler)
    }

    initSocket()

    // Clean up on unmount or when user/token changes
    return () => {
      console.log("[SocketContext] Cleaning up socket listeners")
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      socketService.off(SOCKET_EVENTS.CONNECT, "context")
      socketService.off(SOCKET_EVENTS.DISCONNECT, "context")
      socketService.off(SOCKET_EVENTS.ERROR, "context")
      socketService.disconnect()
    }
  }, [user, token])

  // Function to add event listener
  const addListener = useCallback((event, callback) => {
    console.log(`[SocketContext] Adding listener for ${event}`)
    return socketService.on(event, "context-dynamic", callback)
  }, [])

  // Function to remove event listener
  const removeListener = useCallback((event, callback) => {
    console.log(`[SocketContext] Removing listener for ${event}`)
    socketService.off(event, "context-dynamic", callback)
  }, [])

  // Function to emit event
  const emit = useCallback((event, data) => {
    console.log(`[SocketContext] Emitting ${event}:`, data)
    return socketService.emit(event, data)
  }, [])

  // Function to join chat room
  const joinChat = useCallback((chatId) => {
    console.log(`[SocketContext] Joining chat ${chatId}`)
    return socketService.joinConversation(chatId)
  }, [])

  // Function to leave chat room
  const leaveChat = useCallback((chatId) => {
    console.log(`[SocketContext] Leaving chat ${chatId}`)
    return socketService.leaveConversation(chatId)
  }, [])

  // Function to emit typing status
  const emitTyping = useCallback((chatId, isTyping) => {
    console.log(`[SocketContext] Emitting typing status for ${chatId}: ${isTyping}`)
    return socketService.sendTypingIndicator(chatId, isTyping)
  }, [])

  // Check if a user is online
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.includes(userId)
    },
    [onlineUsers],
  )

  // Get typing users for a specific chat
  const getTypingUsers = useCallback(
    (chatId) => {
      return typingUsers[chatId] || []
    },
    [typingUsers],
  )

  const value = {
    isConnected,
    onlineUsers,
    typingUsers,
    addListener,
    removeListener,
    emit,
    joinChat,
    leaveChat,
    emitTyping,
    isUserOnline,
    getTypingUsers,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export default SocketContext
