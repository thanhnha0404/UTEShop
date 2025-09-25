import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCart, checkoutCOD, getMyVouchers } from "../services/product.services";
import Modal from "../components/Modal";
import { getToken } from "../utils/authStorage";
import PaymentWithLoyalty from "../components/PaymentWithLoyalty";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState("cod");
  const [showPromo, setShowPromo] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    (async () => {
      const data = await getMyCart({ token });
      setItems(Array.isArray(data.items) ? data.items : []);
      // load applied voucher from sessionStorage (set at Cart)
      try {
        const raw = sessionStorage.getItem('applied_voucher');
        if (raw) setAppliedVoucher(JSON.parse(raw));
      } catch(_){}
    })();
  }, [token, navigate]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it?.drink?.salePrice || it?.drink?.price || 0) * it.quantity, 0);
  }, [items]);

  const shippingFee = items.length > 0 ? 20000 : 0;
  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const minTotal = Number(appliedVoucher.min_order_total || 0);
    if (subtotal < minTotal) return 0;
    if (appliedVoucher.discount_type === 'percent') {
      const percent = Number(appliedVoucher.discount_value || 0);
      return Math.floor((subtotal * percent) / 100);
    }
    return Math.min(Number(appliedVoucher.discount_value || 0), subtotal);
  }, [appliedVoucher, subtotal]);
  const total = Math.max(0, subtotal + shippingFee - voucherDiscount);

  const handleCheckout = async (paymentData) => {
    console.log('🚀 Starting checkout process...', { paymentData, token: !!token });
    
    if (payment !== "cod") {
      const event = new CustomEvent("toast:show", { detail: { type: "error", message: "VNPay chưa được triển khai trong bản này" } });
      window.dispatchEvent(event);
      return;
    }
    
    // Kiểm tra xem user đã đăng nhập chưa
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
      
      // Gọi API checkout với thông tin xu
      const response = await fetch('http://localhost:8080/api/checkout/cod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          loyaltyPointsUsed: paymentData.loyaltyPointsUsed || 0
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-extrabold text-indigo-700">XÁC NHẬN THANH TOÁN</div>
          <div className="p-4">
            <div className="text-sm text-gray-600">ĐỊA CHỈ NHẬN HÀNG</div>
            <div className="mt-1">Địa chỉ cụ thể: <span className="text-gray-500">null, null, null, null</span></div>
            <div className="mt-1">Người nhận: <span className="font-medium">Bạn</span></div>
          </div>
        </section>

        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-bold">PHƯƠNG THỨC VẬN CHUYỂN</div>
          <div className="p-4">
            <label className="flex items-start gap-2">
              <input type="radio" defaultChecked className="accent-indigo-600 mt-1" />
              <div>
                <div>Giao hàng tiêu chuẩn: <span className="font-semibold">{shippingFee.toLocaleString()}₫</span></div>
                <div className="text-sm text-gray-500">Dự kiến nhận hàng: 2-3 ngày</div>
              </div>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-bold">PHƯƠNG THỨC THANH TOÁN</div>
          <div className="p-4 space-y-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="payment" value="cod" className="accent-indigo-600" checked={payment === "cod"} onChange={(e) => setPayment(e.target.value)} />
              <span>Thanh toán khi nhận hàng</span>
            </label>
            <label className="flex items-center gap-2 opacity-80">
              <input type="radio" name="payment" value="vnpay" className="accent-indigo-600" checked={payment === "vnpay"} onChange={(e) => setPayment(e.target.value)} />
              <span>VNPay</span>
              <span className="text-xs text-gray-500">(Chỉ hiển thị, chưa hoạt động)</span>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between font-bold">
            <span>KHUYẾN MÃI (đã chọn)</span>
            <button
              className="text-indigo-600 hover:underline"
              onClick={async () => {
                if (!voucherOpen) {
                  try {
                    const res = await getMyVouchers({ token });
                    setVouchers(Array.isArray(res.vouchers) ? res.vouchers : []);
                  } catch (err) {
                    // ignore
                  }
                }
                setVoucherOpen(v => !v);
                setShowPromo(s => !s);
              }}
            >
              {voucherOpen ? 'Ẩn bớt' : 'Xem thêm'}
            </button>
          </div>
          {voucherOpen && (
            <Modal
              open={voucherOpen}
              title="Khuyến mãi"
              description="Chọn mã giảm giá áp dụng cho đơn hàng"
              onClose={() => setVoucherOpen(false)}
              actions={
                <button onClick={() => setVoucherOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Đóng</button>
              }
            >
              <div className="max-h-[70vh] overflow-auto space-y-6">
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Mã giảm giá</h4>
                    <span className="text-sm text-gray-500">Áp dụng tối đa 1</span>
                  </div>
                  {vouchers.length === 0 ? (
                    <div className="text-sm text-gray-600">Không có voucher khả dụng</div>
                  ) : (
                    <div className="space-y-3">
                      {vouchers.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-4 rounded border bg-yellow-50">
                          <div>
                            <div className="font-semibold">{v.code}</div>
                            <div className="text-sm text-gray-600">
                              {v.discount_type === 'percent' ? `Giảm ${Number(v.discount_value).toLocaleString()}%` : `Giảm ${Number(v.discount_value).toLocaleString()} đ`} {Number(v.min_order_total || 0) > 0 ? `cho đơn từ ${Number(v.min_order_total).toLocaleString()} đ` : ''}
                            </div>
                          </div>
                          <button
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg"
                            onClick={() => { setAppliedVoucher(v); setVoucherOpen(false); }}
                          >
                            Áp dụng
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Mã vận chuyển</h4>
                    <span className="text-sm text-gray-500">Áp dụng tối đa 1</span>
                  </div>
                  <div className="text-sm text-gray-500">Hiện chưa có mã freeship.</div>
                </section>
              </div>
            </Modal>
          )}
        </section>

        {/* Payment with Loyalty Points */}
        <PaymentWithLoyalty
          cartItems={items}
          onCheckout={handleCheckout}
          loading={checkoutLoading}
          voucherDiscountAmount={voucherDiscount}
        />

        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-bold">KIỂM TRA ĐƠN HÀNG</div>
          <div className="divide-y">
            {items.length === 0 ? (
              <div className="p-4 text-gray-500">Giỏ hàng trống</div>
            ) : (
              items.map(it => (
                <div key={it.id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={it?.drink?.image_url || "/logo192.png"} alt={it?.drink?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{it?.drink?.name}</div>
                    <div className="text-sm text-gray-500">Số lượng: {it.quantity}</div>
                  </div>
                  <div className="w-24 text-right font-semibold text-red-600">{(Number(it?.drink?.salePrice || it?.drink?.price || 0) * it.quantity).toLocaleString()}₫</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="font-bold mb-3">TỔNG KẾT</div>
          <div className="flex justify-between mb-2">
            <span>Tổng tiền:</span>
            <span className="font-semibold whitespace-nowrap">{subtotal.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Phí vận chuyển:</span>
            <span className="font-semibold whitespace-nowrap">{shippingFee.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Voucher freeship:</span>
            <span className="whitespace-nowrap">- 0₫</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Voucher giảm giá{appliedVoucher ? ` (${appliedVoucher.code})` : ''}:</span>
            <span className="whitespace-nowrap">- {voucherDiscount.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold">
            <span>Thành tiền:</span>
            <span className="text-red-600">{total.toLocaleString()}₫</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            * Sử dụng xu để giảm giá trong phần thanh toán bên dưới
          </div>
        </div>
      </div>
    </div>
  );
}


