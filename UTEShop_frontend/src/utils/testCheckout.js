// Utility để test thanh toán
export const testCheckout = async () => {
  try {
    console.log('🧪 Testing checkout...');
    
    // Test API call
    const response = await fetch('http://localhost:8080/api/checkout/cod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        loyaltyPointsUsed: 0
      })
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error('Test checkout error:', error);
    return { success: false, error: error.message };
  }
};

// Test loyalty points API
export const testLoyaltyPoints = async () => {
  try {
    console.log('🧪 Testing loyalty points...');
    
    const response = await fetch('http://localhost:8080/api/loyalty/points', {
      credentials: 'include'
    });

    console.log('Loyalty response status:', response.status);
    const result = await response.json();
    console.log('Loyalty response data:', result);
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error('Test loyalty points error:', error);
    return { success: false, error: error.message };
  }
};

// Test cart API
export const testCart = async () => {
  try {
    console.log('🧪 Testing cart...');
    
    const response = await fetch('http://localhost:8080/api/cart', {
      credentials: 'include'
    });

    console.log('Cart response status:', response.status);
    const result = await response.json();
    console.log('Cart response data:', result);
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error('Test cart error:', error);
    return { success: false, error: error.message };
  }
};
