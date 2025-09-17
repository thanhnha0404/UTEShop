import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCart, checkoutCOD } from "../services/product.services";
import { getToken } from "../utils/authStorage";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState("cod");
  const [showPromo, setShowPromo] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    (async () => {
      const data = await getMyCart({ token });
      setItems(Array.isArray(data.items) ? data.items : []);
    })();
  }, [token, navigate]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it?.drink?.salePrice || it?.drink?.price || 0) * it.quantity, 0);
  }, [items]);

  const shippingFee = items.length > 0 ? 20000 : 0;
  const total = subtotal + shippingFee;

  const placeOrder = async () => {
    if (payment !== "cod") {
      const event = new CustomEvent("toast:show", { detail: { type: "error", message: "VNPay chưa được triển khai trong bản này" } });
      window.dispatchEvent(event);
      return;
    }
    try {
      const data = await checkoutCOD({ token });
      const event = new CustomEvent("toast:show", { detail: { type: "success", message: "Đơn hàng đã được đặt thành công!" } });
      window.dispatchEvent(event);
      sessionStorage.setItem("last_order", JSON.stringify(data.order));
      window.dispatchEvent(new Event('cart:updated'));
      setTimeout(() => navigate("/orders"), 900);
    } catch (err) {
      const event = new CustomEvent("toast:show", { detail: { type: "error", message: err?.response?.data?.message || "Có lỗi khi đặt hàng" } });
      window.dispatchEvent(event);
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
                <div>Giao hàng tiêu chuẩn: <span className="font-semibold">{shippingFee.toLocaleString()} đ</span></div>
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
            <button className="text-indigo-600 hover:underline" onClick={() => setShowPromo(s => !s)}>
              {showPromo ? "Ẩn bớt" : "Xem thêm"}
            </button>
          </div>
          {showPromo && (
            <div className="p-4 text-sm text-gray-600">
              Chọn mã giảm giá hoặc freeship tại đây (UI demo).
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border">
          <div className="p-4 border-b font-bold">SỬ DỤNG UTE COIN</div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <input className="w-20 border rounded px-2 py-1" type="number" min="0" defaultValue={0} />
              <span className="text-gray-600">coins (Số dư: 0 coins)</span>
            </div>
            <div className="text-xs text-red-500 mt-2">Không thể áp dụng coin nếu đã vượt quá 50% giá trị tổng tiền</div>
          </div>
        </section>

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
                  <div className="w-24 text-right font-semibold text-red-600">{(Number(it?.drink?.salePrice || it?.drink?.price || 0) * it.quantity).toLocaleString()} đ</div>
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
            <span className="font-semibold">{subtotal.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Phí vận chuyển:</span>
            <span className="font-semibold">{shippingFee.toLocaleString()} đ</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Voucher freeship:</span>
            <span>- 0 đ</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Voucher giảm giá:</span>
            <span>- 0 đ</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Giảm giá từ UTE Coin:</span>
            <span>- 0 đ</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold">
            <span>Thành tiền:</span>
            <span className="text-red-600">{total.toLocaleString()} đ</span>
          </div>
          <button onClick={placeOrder} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg">XÁC NHẬN THANH TOÁN</button>
        </div>
      </div>
    </div>
  );
}


