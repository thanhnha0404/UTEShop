import React from 'react';

const CashFlowSummary = ({ data, title = "Phân tích dòng tiền" }) => {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    );
  }

  // Debug logging to track data updates
  console.log('CashFlowSummary data:', data);

  const deliveredAmount = Number(data.deliveredOrders?.totalAmount) || 0;
  const pendingAmount = Number(data.pendingOrders?.totalAmount) || 0;
  const netCashFlow = Number(data.netCashFlow) || 0;
  
  const deliveredCount = Number(data.deliveredOrders?.count) || 0;
  const pendingCount = Number(data.pendingOrders?.count) || 0;

  const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(numAmount);
  };

  const getCashFlowColor = (amount) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCashFlowIcon = (amount) => {
    if (amount > 0) return '↗';
    if (amount < 0) return '↘';
    return '→';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delivered Orders */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Đơn hàng đã giao</span>
            </div>
            <span className="text-green-600 text-lg">✓</span>
          </div>
          <div className="text-2xl font-bold text-green-700 mb-1">
            {formatCurrency(deliveredAmount)}
          </div>
          <div className="text-sm text-green-600">
            {deliveredCount} đơn hàng
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800">Đơn hàng chờ xử lý</span>
            </div>
            <span className="text-orange-600 text-lg">⏳</span>
          </div>
          <div className="text-2xl font-bold text-orange-700 mb-1">
            {formatCurrency(pendingAmount)}
          </div>
          <div className="text-sm text-orange-600">
            {pendingCount} đơn hàng
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className={`bg-gradient-to-br ${netCashFlow >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-red-50 to-red-100 border-red-200'} rounded-lg p-4 border`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 ${netCashFlow >= 0 ? 'bg-blue-500' : 'bg-red-500'} rounded-full`}></div>
              <span className={`text-sm font-medium ${netCashFlow >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                Dòng tiền ròng
              </span>
            </div>
            <span className={`${getCashFlowColor(netCashFlow)} text-lg`}>
              {getCashFlowIcon(netCashFlow)}
            </span>
          </div>
          <div className={`text-2xl font-bold ${getCashFlowColor(netCashFlow)} mb-1`}>
            {formatCurrency(netCashFlow)}
          </div>
          <div className={`text-sm ${getCashFlowColor(netCashFlow)}`}>
            {netCashFlow >= 0 ? 'Lãi ròng' : 'Lỗ ròng'}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng giá trị đơn hàng:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(deliveredAmount + pendingAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
            <span className="font-medium text-gray-900">
              {deliveredAmount + pendingAmount > 0 
                ? `${Math.round((deliveredAmount / (deliveredAmount + pendingAmount)) * 100)}%`
                : '0%'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowSummary;
