// Test script để kiểm tra notification badge
// Chạy script này để test tạo thông báo và kiểm tra badge

const axios = require('axios');

async function testNotificationBadge() {
  const API_BASE_URL = 'http://localhost:8080/api';
  
  console.log('🧪 Testing Notification Badge...\n');

  try {
    // Test 1: Tạo thông báo mới
    console.log('1️⃣ Creating new notification...');
    const createResponse = await axios.post(`${API_BASE_URL}/notifications`, {
      user_id: 1,
      type: 'system',
      title: 'Test Badge Notification',
      message: 'This notification should show a badge on the bell icon'
    });
    console.log('✅ Notification created:', createResponse.data.message);

    // Test 2: Kiểm tra unread count
    console.log('\n2️⃣ Checking unread count...');
    const unreadResponse = await axios.get(`${API_BASE_URL}/notifications/1/unread-count`);
    console.log('✅ Unread count:', unreadResponse.data.data.unreadCount);
    
    if (unreadResponse.data.data.unreadCount > 0) {
      console.log('🎉 Badge should be visible on the bell icon!');
    } else {
      console.log('❌ No unread notifications - badge should be hidden');
    }

    // Test 3: Tạo thêm vài thông báo để test badge số lượng
    console.log('\n3️⃣ Creating multiple notifications...');
    for (let i = 1; i <= 3; i++) {
      await axios.post(`${API_BASE_URL}/notifications`, {
        user_id: 1,
        type: 'order',
        title: `Test Order ${i}`,
        message: `This is test order notification ${i}`
      });
    }

    // Test 4: Kiểm tra lại unread count
    console.log('\n4️⃣ Checking updated unread count...');
    const updatedUnreadResponse = await axios.get(`${API_BASE_URL}/notifications/1/unread-count`);
    console.log('✅ Updated unread count:', updatedUnreadResponse.data.data.unreadCount);
    
    if (updatedUnreadResponse.data.data.unreadCount >= 4) {
      console.log('🎉 Badge should show number', updatedUnreadResponse.data.data.unreadCount);
    }

    // Test 5: Mark một thông báo là đã đọc
    console.log('\n5️⃣ Marking notification as read...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications/1/recent?limit=1`);
    if (notificationsResponse.data.data.length > 0) {
      const notificationId = notificationsResponse.data.data[0].id;
      await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
      console.log('✅ Marked notification as read');
      
      // Kiểm tra unread count sau khi mark as read
      const afterReadResponse = await axios.get(`${API_BASE_URL}/notifications/1/unread-count`);
      console.log('✅ Unread count after marking as read:', afterReadResponse.data.data.unreadCount);
    }

    console.log('\n🎯 Test completed! Check the frontend to see the badge on the bell icon.');
    console.log('📱 Expected behavior:');
    console.log('   - Bell icon should have a red badge with white number');
    console.log('   - Badge should update in real-time when new notifications arrive');
    console.log('   - Badge should decrease when notifications are marked as read');
    console.log('   - Badge should disappear when all notifications are read');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Chạy test
testNotificationBadge();
