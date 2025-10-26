import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCart, checkoutCOD, getMyVouchers } from "../services/product.services";
import { validateVoucher } from "../services/api.services";
import Modal from "../components/Modal";
import { getToken, getUser } from "../utils/authStorage";
import { getUserProfile } from "../services/user.services";
import PaymentWithLoyalty from "../components/PaymentWithLoyalty";

function normalizeImages(imageUrl) {
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/logo192.png"];
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState("cod");
  const [showPromo, setShowPromo] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValidation, setVoucherValidation] = useState({ loading: false, error: null, valid: false });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [userInfo, setUserInfo] = useState(null);
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Set initial user from localStorage
    const user = getUser();
    console.log('🔍 User info from localStorage:', user);
    if (user) {
      setUserInfo({
        fullName: user.fullName || user.full_name || user.name,
        phone: user.phone || user.phoneNumber || user.phone_number,
        address: user.address,
        email: user.email
      });
    }
    
    // Fetch fresh data from API (service đã normalize)
    getUserProfile(token).then(profile => {
      console.log('🔍 User profile in CheckoutPage:', profile);
      setUserInfo(profile);
    }).catch(err => {
      console.error('❌ Error fetching user profile:', err);
      // Keep using localStorage data if API fails
    });
    
    (async () => {
      const data = await getMyCart({ token });
      const rows = Array.isArray(data.items) ? data.items : [];
      
      console.log('🔍 RAW data from backend in Checkout:', rows);
      
      const processedRows = rows.map(item => {
        // Xác định size từ nhiều nguồn
        const isUpsizedValue = Boolean(
          item.isUpsized === true || 
          item.isUpsized === 1 || 
          item.isUpsized === "true" ||
          item.size === "L"
        );
        
        console.log('🔍 Processing checkout item:', {
          name: item?.drink?.name,
          size_raw: item.size,
          isUpsized_raw: item.isUpsized,
          isUpsized_boolean: isUpsizedValue,
          final_size: isUpsizedValue ? 'L' : 'M'
        });
        
        return {
          ...item,
          isUpsized: isUpsizedValue,
          size: item.size || (isUpsizedValue ? 'L' : 'M') // Đảm bảo size luôn có giá trị
        };
      });
      
      setItems(processedRows);
      
      try {
        const raw = sessionStorage.getItem('applied_voucher');
        if (raw) {
          const voucher = JSON.parse(raw);
          setAppliedVoucher(voucher);
          setVoucherCode(voucher.code || "");
        }
      } catch(_){}
    })();
  }, [token, navigate]);

  // Listen for user updates
  useEffect(() => {
    const handleUserUpdate = () => {
      const user = getUser();
      if (user) {
        setUserInfo({
          fullName: user.fullName || user.full_name || user.name,
          phone: user.phone || user.phoneNumber || user.phone_number,
          address: user.address,
          email: user.email
        });
      }
    };

    window.addEventListener('user:updated', handleUserUpdate);
    return () => window.removeEventListener('user:updated', handleUserUpdate);
  }, []);

  // Tính toán chi tiết từng item (dùng chung cho cả hiển thị và tổng)
  const itemsWithCalculation = useMemo(() => {
    return items.map(it => {
      const basePrice = Number(it?.drink?.salePrice || it?.drink?.price || 0);
      
      // Kiểm tra upsize từ nhiều nguồn
      const hasUpsize = Boolean(
        it.isUpsized === true || 
        it.isUpsized === 1 || 
        it.isUpsized === "true" ||
        it.size === "L" ||
        it.size === "l"
      );
      
      const priceWithUpsize = basePrice + (hasUpsize ? 5000 : 0);
      const itemTotal = priceWithUpsize * it.quantity;
      
      // Xác định size hiển thị: nếu có upsize thì luôn là L
      const displaySize = hasUpsize ? 'L' : 'M';
      
      console.log('🔍 Item calculation:', {
        name: it?.drink?.name,
        isUpsized_raw: it.isUpsized,
        size_raw: it.size,
        hasUpsize,
        displaySize,
        basePrice,
        priceWithUpsize
      });
      
      return {
        ...it,
        basePrice,
        priceWithUpsize,
        itemTotal,
        displaySize,
        hasUpsize
      };
    });
  }, [items]);

  const subtotal = useMemo(() => {
    const total = itemsWithCalculation.reduce((sum, it) => sum + it.itemTotal, 0);
    
    console.log('💰 Calculating subtotal:', itemsWithCalculation.map(it => ({
      name: it?.drink?.name,
      isUpsized: it.hasUpsize,
      size: it.displaySize,
      basePrice: it.basePrice,
      priceWithUpsize: it.priceWithUpsize,
      quantity: it.quantity,
      itemTotal: it.itemTotal
    })));
    
    return total;
  }, [itemsWithCalculation]);

  const shippingFee = useMemo(() => {
    if (items.length === 0) return 0;
    const fee = shippingMethod === 'express' ? 15000 : 10000;
    console.log('🔍 Shipping fee calculation:', { shippingMethod, fee, itemsLength: items.length });
    return fee;
  }, [items.length, shippingMethod]);

  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const minTotal = Number(appliedVoucher.min_order_amount || 0);
    if (subtotal < minTotal) return 0;
    if (appliedVoucher.discount_type === 'percentage') {
      const percent = Number(appliedVoucher.discount_value || 0);
      const discount = Math.floor((subtotal * percent) / 100);
      const maxDiscount = appliedVoucher.max_discount_amount || Infinity;
      return Math.min(discount, maxDiscount);
    }
    return Math.min(Number(appliedVoucher.discount_value || 0), subtotal);
  }, [appliedVoucher, subtotal]);

  const total = Math.max(0, subtotal + shippingFee - voucherDiscount);

  const validateVoucherCode = async (code) => {
    if (!code.trim()) {
      setVoucherValidation({ loading: false, error: null, valid: false });
      setAppliedVoucher(null);
      sessionStorage.removeItem('applied_voucher');
      return;
    }

    setVoucherValidation({ loading: true, error: null, valid: false });
    
    try {
      const result = await validateVoucher(code, subtotal);
      if (result.success && result.data.valid) {
        setAppliedVoucher(result.data.voucher);
        setVoucherValidation({ loading: false, error: null, valid: true });
        sessionStorage.setItem('applied_voucher', JSON.stringify(result.data.voucher));
      } else {
        setAppliedVoucher(null);
        setVoucherValidation({ 
          loading: false, 
          error: result.error || 'Voucher không hợp lệ', 
          valid: false 
        });
        sessionStorage.removeItem('applied_voucher');
      }
    } catch (error) {
      setAppliedVoucher(null);
      setVoucherValidation({ 
        loading: false, 
        error: 'Lỗi khi xác thực voucher', 
        valid: false 
      });
      sessionStorage.removeItem('applied_voucher');
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (voucherCode) {
        validateVoucherCode(voucherCode);
      } else {
        setAppliedVoucher(null);
        setVoucherValidation({ loading: false, error: null, valid: false });
        sessionStorage.removeItem('applied_voucher');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voucherCode, subtotal]);

  const handleCheckout = async (paymentData) => {
    console.log('🚀 Starting checkout process...', { paymentData, token: !!token });
    
    if (payment !== "cod") {
      const event = new CustomEvent("toast:show", { detail: { type: "error", message: "VNPay chưa được triển khai trong bản này" } });
      window.dispatchEvent(event);
      return;
    }
    
    if (!token) {
      console.error('❌ No token found');
      const event = new CustomEvent("toast:show", { detail: { type: "error", message: "Vui lòng đăng nhập để thanh toán" } });
      window.dispatchEvent(event);
      navigate('/login');
      return;
    }
    
    setCheckoutLoading(true);
    try {
      console.log('📤 Sending checkout request...');
      
      const response = await fetch('http://localhost:8080/api/checkout/cod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          loyaltyPointsUsed: paymentData.loyaltyPointsUsed || 0,
          voucherCode: appliedVoucher ? appliedVoucher.code : null,
          shippingMethod: shippingMethod
        })
      });

      console.log('📥 Checkout response status:', response.status);
      const result = await response.json();
      console.log('📥 Checkout response data:', result);
      
      if (response.ok) {
        console.log('✅ Checkout successful!');
        const event = new CustomEvent("toast:show", { detail: { type: "success", message: "Đơn hàng đã được đặt thành công!" } });
        window.dispatchEvent(event);
        sessionStorage.setItem("last_order", JSON.stringify(result.order));
        sessionStorage.removeItem('applied_voucher');
        window.dispatchEvent(new Event('cart:updated'));
        setTimeout(() => navigate("/orders"), 900);
      } else {
        console.error('❌ Checkout failed:', result);
        const event = new CustomEvent("toast:show", { detail: { type: "error", message: result.message || "Có lỗi khi đặt hàng" } });
        window.dispatchEvent(event);
      }
    } catch (err) {
      console.error('❌ Checkout error:', err);
      const event = new CustomEvent("toast:show", { detail: { type: "error", message: "Có lỗi khi đặt hàng. Vui lòng thử lại." } });
      window.dispatchEvent(event);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedVoucher(null);
    setVoucherValidation({ loading: false, error: null, valid: false });
    sessionStorage.removeItem('applied_voucher');
  };

  const handleApplyVoucher = (voucher) => {
    setAppliedVoucher(voucher);
    setVoucherCode(voucher.code);
    setVoucherOpen(false);
    sessionStorage.setItem('applied_voucher', JSON.stringify(voucher));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        {/* Địa chỉ nhận hàng */}
        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-extrabold text-indigo-700">XÁC NHẬN THANH TOÁN</div>
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-3">ĐỊA CHỈ NHẬN HÀNG</div>
            <div className="mt-1">
              Địa chỉ cụ thể: 
              <span className="text-gray-900 font-medium ml-2">
                {userInfo?.address || (
                  <span className="text-orange-600">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="underline hover:text-orange-700"
                    >
                      Cập nhật ngay
                    </button>
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1">
              Người nhận: 
              <span className="font-medium ml-2">{userInfo?.fullName || "Bạn"}</span>
            </div>
            <div className="mt-1">
              Số điện thoại: 
              <span className="font-medium ml-2">
                {userInfo?.phone || (
                  <span className="text-orange-600">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="underline hover:text-orange-700"
                    >
                      Cập nhật ngay
                    </button>
                  </span>
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Phương thức vận chuyển */}
        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-bold">PHƯƠNG THỨC VẬN CHUYỂN</div>
          <div className="p-4 space-y-3">
            <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input 
                type="radio" 
                name="shipping"
                value="standard"
                checked={shippingMethod === 'standard'}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="accent-indigo-600 mt-1" 
              />
              <div>
                <div>Giao hàng tiêu chuẩn: <span className="font-semibold">10,000₫</span></div>
                <div className="text-sm text-gray-500">Dự kiến nhận hàng: 10 phút</div>
              </div>
            </label>
            
            <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input 
                type="radio" 
                name="shipping"
                value="express"
                checked={shippingMethod === 'express'}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="accent-indigo-600 mt-1" 
              />
              <div>
                <div>Giao nhanh: <span className="font-semibold">15,000₫</span></div>
                <div className="text-sm text-gray-500">Dự kiến nhận hàng: 5 phút</div>
              </div>
            </label>
          </div>
        </section>

        {/* Phương thức thanh toán */}
        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-bold">PHƯƠNG THỨC THANH TOÁN</div>
          <div className="p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input 
                type="radio" 
                name="payment" 
                value="cod" 
                className="accent-indigo-600" 
                checked={payment === "cod"} 
                onChange={(e) => setPayment(e.target.value)} 
              />
              <span>Thanh toán khi nhận hàng</span>
            </label>
            <label className="flex items-center gap-2 opacity-80 cursor-not-allowed hover:bg-gray-50 p-2 rounded-lg transition">
              <input 
                type="radio" 
                name="payment" 
                value="vnpay" 
                className="accent-indigo-600" 
                checked={payment === "vnpay"} 
                onChange={(e) => setPayment(e.target.value)} 
              />
              <span>VNPay</span>
              <span className="text-xs text-gray-500">(Chỉ hiển thị, chưa hoạt động)</span>
            </label>
          </div>
        </section>

        {/* Payment with Loyalty */}
        <PaymentWithLoyalty
          cartItems={items}
          onCheckout={handleCheckout}
          loading={checkoutLoading}
          voucherDiscountAmount={voucherDiscount}
          shippingMethod={shippingMethod}
          subtotalWithUpsize={subtotal}
          shippingFee={shippingFee}
        />

        {/* Kiểm tra đơn hàng */}
        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-bold">KIỂM TRA ĐƠN HÀNG</div>
          <div className="divide-y">
            {itemsWithCalculation.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">Giỏ hàng trống</div>
            ) : (
              itemsWithCalculation.map(it => (
                <div key={it.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={normalizeImages(it?.drink?.image_url)[0]} 
                      alt={it?.drink?.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{it?.drink?.name}</div>
                    <div className="text-sm text-gray-500">
                      Số lượng: {it.quantity} • Size: {it.displaySize}
                    </div>
                    {(it.iceLevel || it.sugarLevel) && (
                      <div className="text-xs text-gray-400">
                        {it.iceLevel && `Đá: ${it.iceLevel}`}
                        {it.iceLevel && it.sugarLevel && ' • '}
                        {it.sugarLevel && `Đường: ${it.sugarLevel}`}
                      </div>
                    )}
                  </div>
                  <div className="w-28 text-right">
                    <div className="font-semibold text-red-600">
                      {it.itemTotal.toLocaleString()}₫
                    </div>
                    {it.hasUpsize && (
                      <div className="text-xs text-orange-600">
                        (+5,000₫)
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Sidebar - Tổng kết */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4 sticky top-4">
          <div className="font-bold mb-4 text-lg">TỔNG KẾT</div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-semibold whitespace-nowrap">{subtotal.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-semibold whitespace-nowrap">{shippingFee.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Voucher freeship:</span>
              <span className="whitespace-nowrap text-gray-500">- 0₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Voucher giảm giá{appliedVoucher ? ` (${appliedVoucher.code})` : ''}:
              </span>
              <span className="whitespace-nowrap text-green-600 font-semibold">
                - {voucherDiscount.toLocaleString()}₫
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-lg font-extrabold pt-3 border-t">
            <span>Thành tiền:</span>
            <span className="text-red-600">{total.toLocaleString()}₫</span>
          </div>
          
          <div className="text-xs text-gray-500 mt-3 bg-blue-50 p-2 rounded">
            💡 Sử dụng xu để giảm giá trong phần thanh toán bên dưới
          </div>
        </div>
      </div>
    </div>
  );
}