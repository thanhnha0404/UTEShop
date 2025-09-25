import React, { useState, useEffect } from 'react';
import { calculateLoyaltyUsage } from '../services/api.services';

const PaymentWithLoyalty = ({ 
  cartItems = [], 
  onCheckout, 
  loading = false,
  voucherDiscountAmount = 0,
}) => {
  const [loyaltyData, setLoyaltyData] = useState({
    currentPoints: 0,
    maxUsablePoints: 0,
    pointsToEarn: 0
  });
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  // Tính tổng tiền gốc
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item?.drink?.salePrice || item?.drink?.price || 0);
    return sum + (price * item.quantity);
  }, 0);
  const shippingFee = cartItems.length > 0 ? 20000 : 0;
  const voucherDiscount = Number(voucherDiscountAmount || 0);
  const totalBeforeDiscount = subtotal + shippingFee; // trước voucher/xu
  const finalTotal = Math.max(0, subtotal + shippingFee - voucherDiscount - loyaltyPointsUsed);

  useEffect(() => {
    if (totalBeforeDiscount > 0) {
      fetchLoyaltyCalculation();
    }
  }, [totalBeforeDiscount]);

  const fetchLoyaltyCalculation = async () => {
    setLoadingLoyalty(true);
    try {
      // Chỉ truyền subtotal để tính xu, không tính shipping fee
      const result = await calculateLoyaltyUsage(subtotal);
      if (result.success) {
        setLoyaltyData(result.data);
        // Reset xu sử dụng nếu vượt quá giới hạn
        if (loyaltyPointsUsed > result.data.maxUsablePoints) {
          setLoyaltyPointsUsed(result.data.maxUsablePoints);
        }
      } else {
        console.error('Lỗi khi lấy thông tin xu:', result.error);
        // Nếu không lấy được xu, set về 0
        setLoyaltyData({
          currentPoints: 0,
          maxUsablePoints: 0,
          pointsToEarn: 0
        });
      }
    } catch (error) {
      console.error('Lỗi khi tính toán xu:', error);
      // Nếu có lỗi, set về 0
      setLoyaltyData({
        currentPoints: 0,
        maxUsablePoints: 0,
        pointsToEarn: 0
      });
    } finally {
      setLoadingLoyalty(false);
    }
  };

  const handleLoyaltyChange = (value) => {
    const points = Math.max(0, Math.min(value, loyaltyData.maxUsablePoints));
    setLoyaltyPointsUsed(points);
  };

  const handleCheckout = () => {
    onCheckout({
      loyaltyPointsUsed,
      subtotal,
      shippingFee,
      voucherDiscount,
      total: finalTotal,
      loyaltyPointsEarned: loyaltyData.pointsToEarn
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const formatPoints = (points) => {
    return points.toLocaleString('vi-VN');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Thanh toán</h2>
      
      {/* Tổng tiền gốc */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span className="font-medium">{formatCurrency(shippingFee)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Voucher:</span>
          <span className="font-medium text-red-600">- {formatCurrency(voucherDiscount)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Tổng tiền gốc:</span>
          <span className="font-bold text-lg">{formatCurrency(totalBeforeDiscount)}</span>
        </div>
      </div>

      {/* Xu hiện có */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Xu hiện có:</span>
          <span className="text-lg font-bold text-purple-600">
            {loadingLoyalty ? '...' : formatPoints(loyaltyData.currentPoints)} xu
          </span>
        </div>
        
        {/* Xu có thể sử dụng */}
        <div className="text-xs text-gray-600 mb-3">
          Có thể sử dụng tối đa: {formatPoints(loyaltyData.maxUsablePoints)} xu
        </div>

        {/* Input xu sử dụng */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Số xu sử dụng:
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLoyaltyChange(loyaltyPointsUsed - 100)}
              disabled={loyaltyPointsUsed <= 0 || loadingLoyalty}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <input
              type="number"
              value={loyaltyPointsUsed}
              onChange={(e) => handleLoyaltyChange(parseInt(e.target.value) || 0)}
              min="0"
              max={loyaltyData.maxUsablePoints}
              disabled={loadingLoyalty}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-medium"
            />
            
            <button
              onClick={() => handleLoyaltyChange(loyaltyPointsUsed + 100)}
              disabled={loyaltyPointsUsed >= loyaltyData.maxUsablePoints || loadingLoyalty}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {/* Quick buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleLoyaltyChange(0)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
            >
              Không dùng
            </button>
            <button
              onClick={() => handleLoyaltyChange(loyaltyData.maxUsablePoints)}
              disabled={loyaltyData.maxUsablePoints === 0}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 disabled:opacity-50"
            >
              Dùng tối đa
            </button>
          </div>
        </div>
      </div>

      {/* Xu sẽ được tích lũy */}
      {loyaltyData.pointsToEarn > 0 && (
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Xu sẽ được tích lũy:</span>
            <span className="text-lg font-bold text-green-600">
              +{formatPoints(loyaltyData.pointsToEarn)} xu
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            (20.000 VNĐ = 100 xu)
          </div>
        </div>
      )}

      {/* Tổng tiền sau giảm */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-800">Tổng tiền phải trả:</span>
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(finalTotal)}
          </span>
        </div>
        
        {loyaltyPointsUsed > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            Đã giảm: {formatCurrency(loyaltyPointsUsed)} ({formatPoints(loyaltyPointsUsed)} xu)
          </div>
        )}
      </div>

      {/* Nút thanh toán */}
      <button
        onClick={handleCheckout}
        disabled={loading || cartItems.length === 0 || loadingLoyalty}
        className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {loading ? 'Đang xử lý...' : cartItems.length === 0 ? 'Giỏ hàng trống' : 'Thanh toán'}
      </button>

      {/* Thông báo lỗi nếu có */}
      {loyaltyData.currentPoints === 0 && !loadingLoyalty && (
        <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
          ⚠️ Không thể lấy thông tin xu. Vui lòng đăng nhập lại hoặc kiểm tra kết nối.
        </div>
      )}

      {/* Thông tin bổ sung */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>• Xu sẽ được cộng vào tài khoản sau khi đơn hàng được xác nhận</p>
        <p>• Xu dư sẽ được giữ lại trong tài khoản</p>
      </div>
    </div>
  );
};

export default PaymentWithLoyalty;
