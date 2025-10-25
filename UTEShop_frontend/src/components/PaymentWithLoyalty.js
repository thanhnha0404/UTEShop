import React, { useState, useEffect } from 'react';
import { calculateLoyaltyUsage } from '../services/api.services';

const PaymentWithLoyalty = ({ 
  cartItems = [], 
  onCheckout, 
  loading = false,
  voucherDiscountAmount = 0,
  shippingMethod = 'standard',
  subtotalWithUpsize = null,  // Nhận từ props
  shippingFee = null,         // Nhận từ props
}) => {
  const [loyaltyData, setLoyaltyData] = useState({
    currentPoints: 0,
    maxUsablePoints: 0,
    pointsToEarn: 0
  });
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  // Tính tổng tiền gốc - ƯU TIÊN dùng từ props (đã có phí upsize)
  const subtotal = subtotalWithUpsize !== null ? subtotalWithUpsize : cartItems.reduce((sum, item) => {
    let price = Number(item?.drink?.salePrice || item?.drink?.price || 0);
    // Nếu không có subtotalWithUpsize từ props, tự tính và cộng phí upsize
    if (item.isUpsized) {
      price += 5000;
    }
    return sum + (price * item.quantity);
  }, 0);
  
  const calculatedShippingFee = shippingFee !== null ? shippingFee : (cartItems.length > 0 ? (shippingMethod === 'express' ? 15000 : 10000) : 0);
  const voucherDiscount = Number(voucherDiscountAmount || 0);
  const totalBeforeDiscount = subtotal + calculatedShippingFee; // trước voucher/xu
  const finalTotal = Math.max(0, subtotal + calculatedShippingFee - voucherDiscount - loyaltyPointsUsed);

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
      shippingFee: calculatedShippingFee,
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
    <div className="bg-white rounded-xl border">
      <div className="p-4 border-b font-bold">THANH TOÁN</div>
      
      <div className="p-4 space-y-4">
        {/* Tổng tiền gốc */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tạm tính:</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="font-semibold">{formatCurrency(calculatedShippingFee)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Voucher:</span>
            <span className="font-semibold text-red-600">- {formatCurrency(voucherDiscount)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
            <span className="text-gray-800">Tổng tiền góc:</span>
            <span>{formatCurrency(totalBeforeDiscount)}</span>
          </div>
        </div>

        {/* Xu hiện có */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Xu hiện có:</span>
            <span className="text-2xl font-bold text-purple-600">
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
                className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                −
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
                className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                +
              </button>
            </div>
            
            {/* Quick buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleLoyaltyChange(0)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                Không dùng
              </button>
              <button
                onClick={() => handleLoyaltyChange(loyaltyData.maxUsablePoints)}
                disabled={loyaltyData.maxUsablePoints === 0}
                className="flex-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition"
              >
                Dùng tối đa
              </button>
            </div>
          </div>
        </div>

        {/* Xu sẽ được tích lũy */}
        {loyaltyData.pointsToEarn > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Xu sẽ được tích lũy:</span>
              <span className="text-2xl font-bold text-green-600">
                +{formatPoints(loyaltyData.pointsToEarn)} xu
              </span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              (20.000 VNĐ = 100 xu)
            </div>
          </div>
        )}

        {/* Tổng tiền sau giảm */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Tổng tiền phải trả:</span>
            <span className="text-3xl font-bold text-red-600">
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
          className="w-full py-4 px-6 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Đang xử lý...' : cartItems.length === 0 ? 'Giỏ hàng trống' : 'XÁC NHẬN THANH TOÁN'}
        </button>

        {/* Thông báo lỗi nếu có */}
        {loyaltyData.currentPoints === 0 && !loadingLoyalty && (
          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
            ⚠️ Không thể lấy thông tin xu. Vui lòng đăng nhập lại hoặc kiểm tra kết nối.
          </div>
        )}

        {/* Thông tin bổ sung */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Xu sẽ được cộng vào tài khoản sau khi đơn hàng được xác nhận</p>
          <p>• Xu dư sẽ được giữ lại trong tài khoản</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentWithLoyalty;