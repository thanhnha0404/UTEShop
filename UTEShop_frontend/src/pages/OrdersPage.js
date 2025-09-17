import React, { useMemo } from "react";

export default function OrdersPage() {
  const order = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("last_order") || "null"); } catch { return null; }
  }, []);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-2xl font-extrabold text-indigo-700 mb-4">Đơn hàng của bạn</div>
          <div className="text-gray-600">Không tìm thấy đơn hàng gần đây.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="bg-white rounded-xl border p-6">
        <div className="text-2xl font-extrabold text-indigo-700 mb-4">Chi tiết đơn hàng</div>
        <div className="text-gray-600 mb-4">Mã đơn: #{order.id}</div>
        <div className="divide-y">
          {order.items.map((it) => (
            <div key={it.id} className="py-3 flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden">
                <img src={it.image_url || "/logo192.png"} alt={it.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{it.name}</div>
                <div className="text-sm text-gray-500">Số lượng: {it.quantity}</div>
              </div>
              <div className="w-24 text-right font-semibold">{(it.price * it.quantity).toLocaleString()} đ</div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between mb-2"><span>Tổng tiền:</span><span className="font-semibold">{order.subtotal.toLocaleString()} đ</span></div>
          <div className="flex justify-between mb-2"><span>Phí vận chuyển:</span><span className="font-semibold">{order.shippingFee.toLocaleString()} đ</span></div>
          <div className="flex justify-between text-lg font-extrabold"><span>Thành tiền:</span><span className="text-red-600">{order.total.toLocaleString()} đ</span></div>
        </div>
      </div>
    </div>
  );
}


