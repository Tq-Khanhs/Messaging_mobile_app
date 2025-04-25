import { io } from "socket.io-client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URL, SOCKET_EVENTS } from "../config/constants"

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000 // 3 seconds
    this.debug = true // Set to false in production
    this._callbackMap = new Map()
  }

  log(...args) {
    if (this.debug) {
      console.log("[SocketService]", ...args)
    }
  }

  // Initialize socket connection
  async init() {
    try {
      console.log("[SocketService] Starting socket initialization...")
      const token = await AsyncStorage.getItem("authToken")

      if (!token) {
        console.error("[SocketService] No auth token found")
        return false
      }

      console.log("[SocketService] Auth token found, length:", token.length)

      // Close existing connection if any
      if (this.socket) {
        console.log("[SocketService] Closing existing socket connection")
        this.socket.disconnect()
        this.socket = null
      }

      // Create new socket connection with auth token
      console.log("[SocketService] Creating new socket connection to:", API_URL)
      this.socket = io(API_URL, {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        timeout: 10000,
        forceNew: true,
        query: {
          clientType: "mobile"
        }
      })

      // Set up event listeners
      this.setupEventListeners()

      // Wait for connection to be established
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error("[SocketService] Socket connection timeout after 5 seconds")
          resolve(false)
        }, 5000)

        this.socket.once(SOCKET_EVENTS.CONNECT, () => {
          clearTimeout(timeout)
          console.log("[SocketService] Socket connected successfully with ID:", this.socket.id)
          resolve(true)
        })

        this.socket.once("connect_error", (error) => {
          clearTimeout(timeout)
          console.error("[SocketService] Socket connection error:", error.message)
          resolve(false)
        })
      })
    } catch (error) {
      console.error("[SocketService] Socket initialization error:", error)
      return false
    }
  }

  setupEventListeners() {
    if (!this.socket) {
      console.error("[SocketService] Cannot setup event listeners: socket is null")
      return
    }

    console.log("[SocketService] Setting up event listeners")

    // Connection events
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("[SocketService] Socket connected:", this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
      this.notifyListeners(SOCKET_EVENTS.CONNECT, { connected: true })
    })

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log("[SocketService] Socket disconnected. Reason:", reason)
      this.isConnected = false
      this.notifyListeners(SOCKET_EVENTS.DISCONNECT, { reason })

      // Handle reconnection if not initiated by client
      if (reason === "io server disconnect" || reason === "transport close") {
        console.log("[SocketService] Attempting to reconnect...")
        this.attemptReconnect()
      }
    })

    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error("[SocketService] Socket error:", error.message)
      this.isConnected = false
      this.notifyListeners(SOCKET_EVENTS.ERROR, { error: error.message })

      // Handle authentication errors
      if (error.message?.includes("authentication")) {
        console.log("[SocketService] Authentication error, clearing token")
        AsyncStorage.removeItem("authToken").catch(console.error)
      }

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log("[SocketService] Attempting to reconnect...")
        this.attemptReconnect()
      }
    })

    // User events
    this.socket.on(SOCKET_EVENTS.USER_STATUS, (data) => {
      console.log("[SocketService] User status event:", data)
      this.notifyListeners(SOCKET_EVENTS.USER_STATUS, data)
    })

    this.socket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      console.log("[SocketService] User joined event:", data)
      this.notifyListeners(SOCKET_EVENTS.USER_JOINED, data)
    })

    this.socket.on(SOCKET_EVENTS.USER_LEFT, (data) => {
      console.log("[SocketService] User left event:", data)
      this.notifyListeners(SOCKET_EVENTS.USER_LEFT, data)
    })

    // Message events
    this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, (data) => {
      console.log("[SocketService] New message event:", data)
      this.notifyListeners(SOCKET_EVENTS.NEW_MESSAGE, data)
    })

    this.socket.on(SOCKET_EVENTS.MESSAGE_READ, (data) => {
      console.log("[SocketService] Message read event:", data)
      this.notifyListeners(SOCKET_EVENTS.MESSAGE_READ, data)
    })

    this.socket.on(SOCKET_EVENTS.MESSAGE_DELETED, (data) => {
      console.log("[SocketService] Message deleted event:", data)
      this.notifyListeners(SOCKET_EVENTS.MESSAGE_DELETED, data)
    })

    this.socket.on(SOCKET_EVENTS.MESSAGE_RECALLED, (data) => {
      console.log("[SocketService] Message recalled event:", data)
      this.notifyListeners(SOCKET_EVENTS.MESSAGE_RECALLED, data)
    })

    this.socket.on(SOCKET_EVENTS.TYPING_INDICATOR, (data) => {
      console.log("[SocketService] Typing indicator event:", data)
      this.notifyListeners(SOCKET_EVENTS.TYPING_INDICATOR, data)
    })

    // Group events
    this.socket.on(SOCKET_EVENTS.GROUP_CREATED, (data) => {
      console.log("[SocketService] Group created event:", data)
      this.notifyListeners(SOCKET_EVENTS.GROUP_CREATED, data)
    })

    this.socket.on(SOCKET_EVENTS.GROUP_UPDATED, (data) => {
      console.log("[SocketService] Group updated event:", data)
      this.notifyListeners(SOCKET_EVENTS.GROUP_UPDATED, data)
    })

    this.socket.on(SOCKET_EVENTS.GROUP_DISSOLVED, (data) => {
      console.log("[SocketService] Group dissolved event:", data)
      this.notifyListeners(SOCKET_EVENTS.GROUP_DISSOLVED, data)
    })

    this.socket.on(SOCKET_EVENTS.GROUP_ADDED, (data) => {
      console.log("[SocketService] Group added event:", data)
      this.notifyListeners(SOCKET_EVENTS.GROUP_ADDED, data)
    })

    this.socket.on(SOCKET_EVENTS.GROUP_REMOVED, (data) => {
      console.log("[SocketService] Group removed event:", data)
      this.notifyListeners(SOCKET_EVENTS.GROUP_REMOVED, data)
    })

    // Log all incoming events
    this.socket.onAny((eventName, ...args) => {
      console.log(`[SocketService] Received event: ${eventName}`, args)
    })
  }

  // Attempt to reconnect to socket server
  attemptReconnect() {
    this.reconnectAttempts++
    console.log(`[SocketService] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(async () => {
      await this.init()
    }, this.reconnectInterval)
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (!this.socket) {
      console.error(`[SocketService] Cannot join conversation ${conversationId}: socket not initialized`);
      return false;
    }

    if (!this.isConnected) {
      console.error(`[SocketService] Cannot join conversation ${conversationId}: socket not connected`);
      return false;
    }

    if (!conversationId) {
      console.error(`[SocketService] Cannot join conversation: invalid conversation ID`);
      return false;
    }

    try {
      console.log(`[SocketService] Joining conversation: ${conversationId}`);
      this.socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conversationId);
      return true;
    } catch (error) {
      console.error(`[SocketService] Error joining conversation ${conversationId}:`, error);
      return false;
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (!this.isConnected || !this.socket) {
      console.log(`[SocketService] Cannot leave conversation ${conversationId}: socket not connected`)
      return false
    }

    console.log(`[SocketService] Leaving conversation: ${conversationId}`)
    this.socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, conversationId)
    return true
  }

  // Send typing indicator
  sendTypingIndicator(conversationId, isTyping) {
    if (!this.isConnected || !this.socket) {
      console.log(`[SocketService] Cannot send typing indicator for ${conversationId}: socket not connected`)
      return false
    }

    console.log(`[SocketService] Sending typing indicator for ${conversationId}: ${isTyping}`)
    this.socket.emit(SOCKET_EVENTS.TYPING_INDICATOR, {
      conversationId,
      isTyping,
    })
    return true
  }

  // Mark message as read
  markMessageAsRead(messageId, conversationId) {
    if (!this.isConnected || !this.socket) {
      console.log(`[SocketService] Cannot mark message ${messageId} as read: socket not connected`)
      return false
    }

    console.log(`[SocketService] Marking message ${messageId} as read in conversation ${conversationId}`)
    this.socket.emit(SOCKET_EVENTS.MESSAGE_READ, {
      messageId,
      conversationId,
    })
    return true
  }

  // Add event listener
  addListener(event, callback) {
    if (!event) {
      console.error("[SocketService] Event name is required");
      return () => {};
    }

    if (typeof callback !== "function") {
      console.error("[SocketService] Callback must be a function");
      return () => {};
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const callbacks = this.listeners.get(event);
    
    // Check if callback is already registered
    if (callbacks.includes(callback)) {
      console.log(`[SocketService] Listener for ${event} already registered`);
      return () => this.removeListener(event, callback);
    }

    callbacks.push(callback);
    console.log(`[SocketService] Added listener for ${event}, total listeners: ${callbacks.length}`);

    // Return a function to remove this listener
    return () => this.removeListener(event, callback);
  }

  // Remove event listener
  removeListener(event, callback) {
    if (!this.listeners.has(event)) return

    const callbacks = this.listeners.get(event)
    const index = callbacks.indexOf(callback)

    if (index !== -1) {
      callbacks.splice(index, 1)
      console.log(`[SocketService] Removed listener for ${event}, remaining listeners: ${callbacks.length}`)
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (!this.listeners.has(event)) return

    const callbacks = this.listeners.get(event)
    console.log(`[SocketService] Notifying ${callbacks.length} listeners for ${event}`)

    callbacks.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`[SocketService] Error in ${event} listener:`, error)
      }
    })
  }

  // Method to register event listener (alias for addListener)
  on(event, namespace, callback) {
    if (!event) {
      console.error("[SocketService] Event name is required");
      return () => {};
    }

    // Handle both formats: on(event, callback) and on(event, namespace, callback)
    if (typeof namespace === "function") {
      callback = namespace;
      namespace = "default";
    }

    if (typeof callback !== "function") {
      console.error(`[SocketService] Invalid callback for event ${event}`);
      return () => {};
    }

    const listenerId = `${event}_${namespace}`;
    console.log(`[SocketService] Registering listener for ${event} with namespace ${namespace}`);

    // Create a wrapper function that we can track
    const wrappedCallback = (data) => {
      try {
        console.log(`[SocketService] Executing listener for ${event} with namespace ${namespace}`);
        callback(data);
      } catch (error) {
        console.error(`[SocketService] Error in ${event} listener:`, error);
      }
    };

    // Store the mapping between the original callback and wrapped callback
    if (!this._callbackMap) this._callbackMap = new Map();
    this._callbackMap.set(`${listenerId}_${callback}`, wrappedCallback);

    return this.addListener(event, wrappedCallback);
  }

  // Method to remove event listener
  off(event, namespace, callback) {
    if (!event) {
      console.error("[SocketService] Event name is required");
      return;
    }

    // Handle both formats: off(event, callback) and off(event, namespace, callback)
    if (typeof namespace === "function") {
      callback = namespace;
      namespace = "default";
    }

    if (typeof callback !== "function") {
      console.error(`[SocketService] Invalid callback for event ${event}`);
      return;
    }

    const listenerId = `${event}_${namespace}`;
    console.log(`[SocketService] Removing listener for ${event} with namespace ${namespace}`);

    // Get the wrapped callback
    if (this._callbackMap && this._callbackMap.has(`${listenerId}_${callback}`)) {
      const wrappedCallback = this._callbackMap.get(`${listenerId}_${callback}`);
      this.removeListener(event, wrappedCallback);
      this._callbackMap.delete(`${listenerId}_${callback}`);
    } else {
      // If we can't find the wrapped callback, try removing the original
      this.removeListener(event, callback);
    }
  }

  // Method to emit event
  emit(event, data) {
    if (!this.socket) {
      console.log(`[SocketService] Cannot emit ${event}: socket not initialized`);
      return false;
    }

    console.log(`[SocketService] Emitting ${event} event:`, data);
    this.socket.emit(event, data);
    return true;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log("[SocketService] Disconnecting socket")
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.listeners.clear()
      console.log("[SocketService] Socket disconnected and cleaned up")
    }
  }

  // Check if socket is connected
  getConnectedStatus() {
    return this.isConnected
  }
}

// Create singleton instance
const socketService = new SocketService()

export default socketService
