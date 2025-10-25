import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getToken } from "../utils/authStorage";

const statusConfig = {
  pending: { label: "Đang chờ", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800", icon: "✅" },
  preparing: { label: "Đang chuẩn bị", color: "bg-orange-100 text-orange-800", icon: "👨‍🍳" },
  shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800", icon: "🚚" },
  delivered: { label: "Đã giao thành công", color: "bg-green-100 text-green-800", icon: "🎉" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800", icon: "❌" },
};

const statusSteps = [
  { key: "pending", label: "Đơn hàng mới", description: "Đơn hàng đã được tạo" },
  { key: "confirmed", label: "Đã xác nhận", description: "Shop đã xác nhận đơn hàng" },
  { key: "preparing", label: "Đang chuẩn bị", description: "Shop đang chuẩn bị hàng" },
  { key: "shipping", label: "Đang giao hàng", description: "Đơn hàng đang được giao" },
  { key: "delivered", label: "Đã giao thành công", description: "Đơn hàng đã được giao thành công" },
];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else if (response.status === 404) {
        setError("Không tìm thấy đơn hàng");
      } else {
        setError("Có lỗi xảy ra khi tải thông tin đơn hàng");
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      setError("Có lỗi xảy ra khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelOrder = () => {
    if (!order) return false;
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const timeDiff = (now - orderTime) / (1000 * 60); // phút
    
    return order.status === "pending" && timeDiff <= 5;
  };

  const canRequestCancel = () => {
    if (!order) return false;
    return ["preparing", "shipping"].includes(order.status);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Người dùng hủy đơn" }),
      });

      if (response.ok) {
        alert("Hủy đơn hàng thành công");
        fetchOrderDetail();
      } else {
        const error = await response.json();
        alert(error.message || "Có lỗi xảy ra khi hủy đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  const handleRequestCancel = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn gửi yêu cầu hủy đơn hàng này?")) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/request-cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Người dùng yêu cầu hủy đơn" }),
      });

      if (response.ok) {
        alert("Đã gửi yêu cầu hủy đơn hàng. Shop sẽ xem xét và phản hồi sớm nhất.");
      } else {
        const error = await response.json();
        alert(error.message || "Có lỗi xảy ra khi gửi yêu cầu hủy đơn");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu hủy đơn:", error);
      alert("Có lỗi xảy ra khi gửi yêu cầu hủy đơn");
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const stepIndex = statusSteps.findIndex(step => step.key === order.status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border p-6 text-center">
          <div className="text-red-600 text-lg mb-4">{error || "Không tìm thấy đơn hàng"}</div>
          <Link
            to="/orders"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-700">Chi tiết đơn hàng</h1>
            <p className="text-gray-600">Mã đơn: #{order.order_number}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig[order.status]?.color || "bg-gray-100 text-gray-800"}`}>
              <span>{statusConfig[order.status]?.icon}</span>
              {statusConfig[order.status]?.label || order.status}
            </div>
            <div className="text-2xl font-bold text-red-600 mt-2">
              {Number(order.total).toLocaleString()}₫
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Ngày đặt:</span> {formatDate(order.created_at)}
          </div>
          <div>
            <span className="font-medium">Phương thức thanh toán:</span> {order.payment_method}
          </div>
          <div>
            <span className="font-medium">Địa chỉ giao hàng:</span> {order.shipping_address}
          </div>
          <div>
            <span className="font-medium">Số điện thoại:</span> {order.shipping_phone}
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Ghi chú:</span> {order.notes}
          </div>
        )}
      </div>

      {/* Order Progress */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Tiến trình đơn hàng</h2>
        <div className="space-y-4">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= getCurrentStepIndex();
            const isCurrent = index === getCurrentStepIndex();
            
            return (
              <div key={step.key} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isCompleted 
                    ? "bg-indigo-600 text-white" 
                    : isCurrent 
                    ? "bg-indigo-100 text-indigo-600 border-2 border-indigo-600" 
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {isCompleted ? "✓" : index + 1}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                  {isCurrent && order[`${step.key}_at`] && (
                    <div className="text-xs text-indigo-600 mt-1">
                      {formatDate(order[`${step.key}_at`])}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Sản phẩm đã đặt</h2>
        <div className="space-y-4">
          {order.orderItems?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img
                  src={item.drink?.image_url || "/logo192.png"}
                  alt={item.drink?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg">{item.drink?.name}</div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Số lượng: {item.quantity}</div>
                  <div>
                    Size: {item.size || 'M'}
                    {item.isUpsized && <span className="text-orange-600 font-medium"> (Upsize +5,000₫)</span>}
                  </div>
                  {item.ice_level && <div>Đá: {item.ice_level}</div>}
                  {item.sugar_level && <div>Đường: {item.sugar_level}</div>}
                  {item.notes && <div>Ghi chú: {item.notes}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">
                  {(Number(item.price) * item.quantity).toLocaleString()}₫
                </div>
                <div className="text-sm text-gray-500">
                  {Number(item.price).toLocaleString()}₫ × {item.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Tổng kết đơn hàng</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Tổng tiền hàng:</span>
            <span>{Number(order.subtotal).toLocaleString()}₫</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển:</span>
            <span>{Number(order.shipping_fee).toLocaleString()}₫</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-xl font-bold">
            <span>Thành tiền:</span>
            <span className="text-red-600">{Number(order.total).toLocaleString()}₫</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Quay lại danh sách
          </Link>
          
          {canCancelOrder() && (
            <button
              onClick={handleCancelOrder}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Hủy đơn hàng
            </button>
          )}
          
          {canRequestCancel() && (
            <button
              onClick={handleRequestCancel}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              Gửi yêu cầu hủy
            </button>
          )}
          
          <Link
            to="/drinks"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Mua thêm
          </Link>
        </div>
      </div>
    </div>
  );
}
