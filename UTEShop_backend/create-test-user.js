const bcrypt = require('bcrypt');
const db = require('./models');

async function createTestUser() {
  try {
    console.log("🔍 Tạo user test...");
    
    // Tạo user mới
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await db.User.create({
      fullName: 'Test User',
      username: 'testuser2',
      password: hashedPassword,
      email: 'test@example.com',
      dob: '1990-01-01',
      phone: '0123456789',
      address: 'Test Address'
    });
    
    console.log("✅ Tạo user thành công:", user.id, user.username);
    
    // Test login
    const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser2',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log("✅ Login test:", loginData);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

createTestUser();
