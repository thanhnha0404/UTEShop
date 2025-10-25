// Test script để kiểm tra nội dung thông báo với order_number
const axios = require('axios');

async function testOrderNotificationContent() {
  const API_BASE_URL = 'http://localhost:8080/api';
  
  console.log('🧪 Testing Order Notification Content...\n');

  try {
    // Test 1: Tạo thông báo đơn hàng mới với order_number
    console.log('1️⃣ Creating order notification with order_number...');
    const createResponse = await axios.post(`${API_BASE_URL}/notifications`, {
      user_id: 1,
      type: 'order',
      title: 'Đơn hàng mới',
      message: 'Đơn hàng "UTE1234567890" đã được tạo thành công với tổng giá trị 94.000 VNĐ.'
    });
    console.log('✅ Order notification created:', createResponse.data.message);

    // Test 2: Kiểm tra nội dung thông báo
    console.log('\n2️⃣ Checking notification content...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications/1/recent?limit=1`);
    if (notificationsResponse.data.data.length > 0) {
      const notification = notificationsResponse.data.data[0];
      console.log('📋 Notification content:');
      console.log('   Title:', notification.title);
      console.log('   Message:', notification.message);
      console.log('   Type:', notification.type);
    }

    // Test 3: Tạo thông báo với số tiền khác nhau để test format
    console.log('\n3️⃣ Testing different amounts...');
    const testAmounts = [94000, 150000, 2500000, 50000];
    
    for (const amount of testAmounts) {
      const formattedAmount = Number(amount).toLocaleString('vi-VN');
      console.log(`   ${amount} VNĐ → ${formattedAmount} VNĐ`);
    }

    // Test 4: Tạo thông báo xác nhận đơn hàng
    console.log('\n4️⃣ Creating order confirmation notification...');
    const confirmResponse = await axios.post(`${API_BASE_URL}/notifications`, {
      user_id: 1,
      type: 'order',
      title: 'Đơn hàng đã được xác nhận',
      message: 'Đơn hàng "UTE1234567890" của bạn đã được xác nhận và đang được chuẩn bị.'
    });
    console.log('✅ Confirmation notification created:', confirmResponse.data.message);

    console.log('\n🎯 Expected notification format:');
    console.log('   📦 New Order: "Đơn hàng [ORDER_NUMBER] đã được tạo thành công với tổng giá trị [AMOUNT] VNĐ."');
    console.log('   ✅ Confirmation: "Đơn hàng [ORDER_NUMBER] của bạn đã được xác nhận và đang được chuẩn bị."');
    console.log('   💰 Amount format: 94.000 VNĐ, 150.000 VNĐ, 2.500.000 VNĐ');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Chạy test
testOrderNotificationContent();
