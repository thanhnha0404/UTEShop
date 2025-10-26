import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../utils/authStorage";

function normalizeImages(imageUrl) {
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    return imageUrl.split(",").map(s => s.trim()).filter(Boolean);
  }
  return ["/logo192.png"];
}

const statusTabs = [
  { key: "all", label: "Tất cả", status: null },
  { key: "pending", label: "Đang chờ", status: "pending" },
  { key: "confirmed", label: "Đã xác nhận", status: "confirmed" },
  { key: "preparing", label: "Đang xử lý", status: "preparing" },
  { key: "shipping", label: "Đang giao hàng", status: "shipping" },
  { key: "delivered", label: "Đã nhận hàng", status: "delivered" },
  { key: "cancelled", label: "Đã hủy", status: "cancelled" },
];

const statusConfig = {
  pending: { label: "Đang chờ", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "Đang chuẩn bị", color: "bg-orange-100 text-orange-800" },
  shipping: { label: "Đang giao hàng", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Đã giao thành công", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (status = null, pageNum = 1) => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10"
      });
      
      if (status && status !== "all") {
        params.append("status", status);
      }

      const response = await fetch(`http://localhost:8080/api/orders/my-orders?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
    const status = statusTabs.find(tab => tab.key === tabKey)?.status;
    fetchOrders(status, 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const status = statusTabs.find(tab => tab.key === activeTab)?.status;
    fetchOrders(status, newPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelOrder = (order) => {
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const timeDiff = (now - orderTime) / (1000 * 60); // phút
    
    return order.status === "pending" && timeDiff <= 5;
  };

  const canRequestCancel = (order) => {
    return ["preparing", "shipping"].includes(order.status);
  };

  const handleCancelOrder = async (orderId) => {
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
        fetchOrders();
      } else {
        const error = await response.json();
        alert(error.message || "Có lỗi xảy ra khi hủy đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  const handleRequestCancel = async (orderId) => {
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

  // Helper function để xác định size hiển thị
  const getDisplaySize = (item) => {
    // Kiểm tra upsize từ nhiều nguồn
    const hasUpsize = Boolean(
      item.isUpsized === true || 
      item.isUpsized === 1 || 
      item.isUpsized === "true" ||
      item.size === "L" ||
      item.size === "l"
    );
    
    return hasUpsize ? 'L' : 'M';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="text-2xl font-extrabold text-indigo-700 mb-4">Đơn hàng của tôi</div>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-extrabold text-indigo-700">Đơn hàng của tôi</h1>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">Không có đơn hàng nào</div>
              <Link
                to="/drinks"
                className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg">Đơn hàng #{order.order_number}</div>
                      <div className="text-sm text-gray-500">
                        Đặt ngày: {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status]?.color || "bg-gray-100 text-gray-800"}`}>
                        {statusConfig[order.status]?.label || order.status}
                      </div>
                      <div className="text-lg font-bold text-red-600 mt-1">
                        {Number(order.total).toLocaleString()}₫
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.orderItems?.slice(0, 2).map((item) => {
                      const displaySize = getDisplaySize(item);
                      const hasUpsize = displaySize === 'L';
                      
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={normalizeImages(item.drink?.image_url)[0]}
                              alt={item.drink?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.drink?.name}</div>
                            <div className="text-sm text-gray-500">
                              SL: {item.quantity} • Size: {displaySize} • {Number(item.price).toLocaleString()}₫
                              {hasUpsize && <span className="text-orange-600 ml-1">(+5k)</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {order.orderItems?.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{order.orderItems.length - 2} sản phẩm khác
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-2">
                      <Link
                        to={`/orders/${order.id}`}
                        className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium"
                      >
                        Chi tiết
                      </Link>
                      
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                        >
                          Hủy đơn
                        </button>
                      )}
                      
                      {canRequestCancel(order) && (
                        <button
                          onClick={() => handleRequestCancel(order.id)}
                          className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 text-sm font-medium"
                        >
                          Gửi yêu cầu hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 border rounded-lg ${
                      page === pageNum
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}