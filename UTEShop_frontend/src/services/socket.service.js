import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Kết nối đến server
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    return this.socket;
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join room của user
  joinUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user-room', userId);
      console.log(`👤 Joined user room: user_${userId}`);
    }
  }

  // Leave room của user
  leaveUserRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-user-room', userId);
      console.log(`👤 Left user room: user_${userId}`);
    }
  }

  // Lắng nghe thông báo mới
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('notification:new', callback);
      
      // Lưu listener để có thể remove sau
      const listenerId = `notification:new_${Date.now()}`;
      this.listeners.set(listenerId, { event: 'notification:new', callback });
      
      return listenerId;
    }
    return null;
  }

  // Remove listener
  removeListener(listenerId) {
    const listener = this.listeners.get(listenerId);
    if (listener && this.socket) {
      this.socket.off(listener.event, listener.callback);
      this.listeners.delete(listenerId);
    }
  }

  // Remove tất cả listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((listener) => {
        this.socket.off(listener.event, listener.callback);
      });
      this.listeners.clear();
    }
  }

  // Kiểm tra trạng thái kết nối
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Emit custom event
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Listen custom event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Off custom event
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Export singleton instance
export default new SocketService();
