const axios = require('axios');

async function testCheckout() {
  try {
    console.log("🔍 Test checkout...");
    
    // Đăng nhập trước
    const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'conganh',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log("✅ Đăng nhập thành công, token:", token.substring(0, 20) + "...");
    
    // Thêm sản phẩm vào giỏ hàng
    const addToCartResponse = await axios.post('http://localhost:8080/api/cart/add', {
      drinkId: 1,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("✅ Thêm vào giỏ hàng:", addToCartResponse.data);
    
    // Checkout
    const checkoutResponse = await axios.post('http://localhost:8080/api/checkout/cod', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("✅ Checkout thành công:", checkoutResponse.data);
    
    // Kiểm tra đơn hàng
    const ordersResponse = await axios.get('http://localhost:8080/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("📦 Danh sách đơn hàng:", ordersResponse.data);
    
  } catch (error) {
    console.error("❌ Lỗi:", error.response?.data || error.message);
  }
}

testCheckout();
