const axios = require('axios');
const io = require('socket.io-client');

// Test Notification System
async function testNotificationSystem() {
  const API_BASE_URL = 'http://localhost:8080/api';
  const SOCKET_URL = 'http://localhost:8080';
  
  console.log('🧪 Testing Notification System...\n');

  try {
    // Test 1: Create notification via API
    console.log('1️⃣ Testing create notification API...');
    const createResponse = await axios.post(`${API_BASE_URL}/notifications`, {
      user_id: 1,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification from the system'
    });
    console.log('✅ Create notification:', createResponse.data);

    // Test 2: Get notifications
    console.log('\n2️⃣ Testing get notifications API...');
    const getResponse = await axios.get(`${API_BASE_URL}/notifications/1`);
    console.log('✅ Get notifications:', getResponse.data.data.notifications.length, 'notifications found');

    // Test 3: Get unread count
    console.log('\n3️⃣ Testing unread count API...');
    const unreadResponse = await axios.get(`${API_BASE_URL}/notifications/1/unread-count`);
    console.log('✅ Unread count:', unreadResponse.data.data.unreadCount);

    // Test 4: Get recent notifications
    console.log('\n4️⃣ Testing recent notifications API...');
    const recentResponse = await axios.get(`${API_BASE_URL}/notifications/1/recent?limit=3`);
    console.log('✅ Recent notifications:', recentResponse.data.data.length, 'notifications');

    // Test 5: Socket.IO connection
    console.log('\n5️⃣ Testing Socket.IO connection...');
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', socket.id);
      
      // Join user room
      socket.emit('join-user-room', 1);
      console.log('✅ Joined user room: user_1');
      
      // Test real-time notification
      setTimeout(() => {
        console.log('\n6️⃣ Testing real-time notification...');
        socket.emit('test-notification', {
          user_id: 1,
          type: 'system',
          title: 'Real-time Test',
          message: 'This is a real-time test notification'
        });
      }, 2000);
      
      // Listen for notifications
      socket.on('notification:new', (notification) => {
        console.log('✅ Received real-time notification:', notification.title);
      });
      
      // Cleanup
      setTimeout(() => {
        socket.disconnect();
        console.log('✅ Socket.IO disconnected');
        process.exit(0);
      }, 5000);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testNotificationSystem();
