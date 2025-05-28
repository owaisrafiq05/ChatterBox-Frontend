import { io } from 'socket.io-client';

let socket = null;
let currentRoom = null;
const SOCKET_URL = 'http://localhost:3000';
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

// Events to handle
const eventHandlers = {
  chatMessage: [],
  userJoined: [],
  userLeft: [],
  error: []
};

// Message queue for handling offline messages
const messageQueue = [];

// Initialize socket connection
const initSocket = (token) => {
  if (socket?.connected) return socket;
  
  socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY,
    transports: ['websocket', 'polling'],
    extraHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  socket.on('connect', () => {
    console.log('Connected to socket server');
    reconnectAttempts = 0;
    // Rejoin room if we were in one
    if (currentRoom) {
      joinRoom(currentRoom);
    }
    // Try to send any queued messages
    flushMessageQueue();
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Disconnected from socket server:', reason);
    if (reason === 'io server disconnect' && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      setTimeout(() => {
        socket.connect();
      }, RECONNECT_DELAY);
    }
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      eventHandlers.error.forEach(handler => handler('Failed to connect to chat server'));
    } else {
      eventHandlers.error.forEach(handler => handler('Maximum reconnection attempts reached'));
      socket.disconnect();
    }
  });
  
  // Set up event listeners with debouncing
  let lastEventTime = {};
  Object.keys(eventHandlers).forEach(event => {
    socket.on(event, (data) => {
      const now = Date.now();
      if (!lastEventTime[event] || now - lastEventTime[event] >= 1000) { // 1 second minimum between same events
        console.log(`Socket event: ${event}`, data);
        eventHandlers[event].forEach(handler => handler(data));
        lastEventTime[event] = now;
      }
    });
  });
  
  return socket;
};

// Add an event handler
const on = (event, handler) => {
  if (!eventHandlers[event]) {
    console.warn(`Unknown socket event: ${event}`);
    return;
  }
  eventHandlers[event].push(handler);
};

// Remove an event handler
const off = (event, handler) => {
  if (!eventHandlers[event]) {
    console.warn(`Unknown socket event: ${event}`);
    return;
  }
  eventHandlers[event] = eventHandlers[event].filter(h => h !== handler);
};

// Try to send queued messages
const flushMessageQueue = () => {
  while (messageQueue.length > 0 && socket?.connected) {
    const { roomId, userId, message } = messageQueue.shift();
    socket.emit('chat-message', { roomId, userId, message });
  }
};

// Join a room
const joinRoom = (roomId) => {
  if (!socket) return;
  currentRoom = roomId;
  socket.emit('join-room', roomId);
};

// Leave a room
const leaveRoom = (roomId) => {
  if (!socket) return;
  currentRoom = null;
  socket.emit('leave-room', roomId);
};

// Send a message to a room
const sendMessage = (roomId, userId, message) => {
  if (!socket?.connected) {
    // Queue message if socket is not connected
    messageQueue.push({ roomId, userId, message });
    return;
  }
  socket.emit('chat-message', { roomId, userId, message });
};

// Get socket ID
const getSocketId = () => {
  if (!socket) return null;
  return socket.id;
};

// Check connection status
const isConnected = () => {
  return socket?.connected || false;
};

// Disconnect socket
const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentRoom = null;
    Object.keys(eventHandlers).forEach(event => {
      eventHandlers[event] = [];
    });
  }
};

export {
  initSocket,
  on,
  off,
  joinRoom,
  leaveRoom,
  sendMessage,
  getSocketId,
  isConnected,
  disconnect
}; 