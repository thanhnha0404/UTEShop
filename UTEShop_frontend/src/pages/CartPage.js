import React, { useEffect, useMemo, useState } from "react";
import { getMyCart, updateCartItem, removeFromCart, getMyVouchers } from "../services/product.services";
import { getToken } from "../utils/authStorage";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState({}); // drinkId -> boolean
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    (async () => {
      const data = await getMyCart({ token });
      const rows = Array.isArray(data.items) ? data.items : [];
      setItems(rows);
      // default tick on
      const initial = {};
      rows.forEach(r => { initial[r.drinkId] = true; });
      setSelected(initial);
    })();
  }, [token, navigate]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const isChecked = selected[it.drinkId];
      if (!isChecked) return sum;
      return sum + Number(it?.drink?.salePrice || it?.drink?.price || 0) * it.quantity;
    }, 0);
  }, [items, selected]);

  const discount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const minTotal = Number(appliedVoucher.min_order_total || 0);
    if (subtotal < minTotal) return 0;
    if (appliedVoucher.discount_type === 'percent') {
      const percent = Number(appliedVoucher.discount_value || 0);
      return Math.floor((subtotal * percent) / 100);
    }
    return Math.min(Number(appliedVoucher.discount_value || 0), subtotal);
  }, [appliedVoucher, subtotal]);
  const grandTotal = Math.max(0, subtotal - discount);

  const allChecked = useMemo(() => {
    if (items.length === 0) return false;
    return items.every(it => selected[it.drinkId]);
  }, [items, selected]);

  const changeQty = async (id, qty) => {
    try {
      await updateCartItem({ drinkId: id, quantity: qty, token });
      setItems(list => list.map(x => x.drinkId === id ? { ...x, quantity: qty } : x));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi');
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromCart({ drinkId: id, token });
      setItems(list => list.filter(x => x.drinkId !== id));
      setSelected(sel => { const copy = { ...sel }; delete copy[id]; return copy; });
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded-xl border">
        <div className="p-4 border-b font-bold flex items-center justify-between">
          <span>GIỎ HÀNG ({items.length} sản phẩm)</span>
          <label className="flex items-center gap-2 text-sm font-normal">
            <input
              type="checkbox"
              className="accent-indigo-600 w-4 h-4"
              checked={allChecked}
              onChange={(e) => {
                const newVal = e.target.checked;
                const next = {};
                items.forEach(it => { next[it.drinkId] = newVal; });
                setSelected(next);
              }}
            />
            Chọn tất cả
          </label>
        </div>
        {items.length === 0 ? (
          <div className="p-6 text-gray-500">Chưa có sản phẩm</div>
        ) : (
          items.map(it => (
            <div key={it.id} className="p-4 flex items-center gap-4 border-b last:border-b-0">
              <input
                type="checkbox"
                className="accent-indigo-600 w-4 h-4"
                checked={!!selected[it.drinkId]}
                onChange={(e) => setSelected(sel => ({ ...sel, [it.drinkId]: e.target.checked }))}
              />
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img src={it?.drink?.image_url || '/logo192.png'} alt={it?.drink?.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{it?.drink?.name}</div>
                <div className="text-sm text-gray-500 line-through">
                  {it?.drink?.salePrice ? Number(it?.drink?.price || 0).toLocaleString() + '₫' : ''}
                </div>
                <div className="text-red-600 font-semibold">{Number(it?.drink?.salePrice || it?.drink?.price || 0).toLocaleString()}₫</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => changeQty(it.drinkId, Math.max(1, it.quantity - 1))}>-</button>
                <span>{it.quantity}</span>
                <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => changeQty(it.drinkId, it.quantity + 1)}>+</button>
              </div>
              <div className="w-20 text-right font-semibold">
                {(Number(it?.drink?.salePrice || it?.drink?.price || 0) * it.quantity).toLocaleString()}₫
              </div>
              <button className="text-gray-500 hover:text-red-600" title="Xóa" onClick={() => removeItem(it.drinkId)}>🗑️</button>
            </div>
          ))
        )}
      </div>
      <div className="bg-white rounded-xl border h-fit p-4">
        <div className="font-bold mb-3">THÀNH TIỀN</div>
        <div className="mb-2">
          <div className="flex justify-between mb-2">
            <span>Tổng tạm tính</span>
            <span className="font-semibold">{subtotal.toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="flex items-center gap-2">
              Khuyến mãi {appliedVoucher ? `(${appliedVoucher.code})` : "(chưa chọn)"}
            </span>
            <button
              className="text-indigo-600 hover:underline"
              onClick={async () => {
                try {
                  if (!voucherOpen) {
                    const res = await getMyVouchers({ token });
                    setVouchers(Array.isArray(res.vouchers) ? res.vouchers : []);
                  }
                  setVoucherOpen(v => !v);
                } catch (err) {
                  alert(err?.response?.data?.message || err?.message || 'Lỗi tải voucher');
                }
              }}
            >
              {voucherOpen ? 'Đóng' : 'Xem thêm'}
            </button>
          </div>
          {voucherOpen && (
            <div className="max-h-64 overflow-auto bg-yellow-50 rounded-lg p-3 mb-2">
              {vouchers.length === 0 ? (
                <div className="text-sm text-gray-600">Không có voucher khả dụng</div>
              ) : (
                vouchers.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-yellow-100 rounded mb-2">
                    <div>
                      <div className="font-semibold">{v.code}</div>
                      <div className="text-sm text-gray-600">
                        {v.discount_type === 'percent' ? `Giảm ${Number(v.discount_value).toLocaleString()}%` : `Giảm ${Number(v.discount_value).toLocaleString()}₫`}
                        {Number(v.min_order_total || 0) > 0 ? ` cho đơn từ ${Number(v.min_order_total).toLocaleString()}₫` : ''}
                      </div>
                    </div>
                    <button
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg"
                      onClick={() => { setAppliedVoucher(v); try { sessionStorage.setItem('applied_voucher', JSON.stringify(v)); } catch(_){} }}
                    >
                      Áp dụng
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex justify-between mb-2">
          <span>Giảm giá</span>
          <span className="font-semibold text-red-600">- {discount.toLocaleString()}₫</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Tổng số tiền</span>
          <span className="font-bold">{grandTotal.toLocaleString()}₫</span>
        </div>
        <button onClick={() => navigate('/checkout')} className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg">THANH TOÁN</button>
      </div>
    </div>
  );
}


