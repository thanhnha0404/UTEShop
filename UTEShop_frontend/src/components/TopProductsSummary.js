import React from 'react';

const TopProductsSummary = ({ data, title = "Top 10 sản phẩm bán chạy" }) => {
  if (!data || !data.topProducts || data.topProducts.length === 0) {
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
  console.log('TopProductsSummary data:', data);
  console.log('TopProductsSummary topProducts:', data?.topProducts);
  console.log('TopProductsSummary topProducts length:', data?.topProducts?.length);
  if (data?.topProducts?.length > 0) {
    console.log('First product sample:', data.topProducts[0]);
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-500';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-orange-400 to-orange-500';
      default: return 'from-blue-400 to-blue-500';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.topProducts.slice(0, 10).map((product, index) => {
          const rank = index + 1;
          const totalQuantity = data.topProducts.reduce((sum, p) => sum + (Number(p.totalQuantity) || 0), 0);
          const percentage = totalQuantity > 0 
            ? Math.round((Number(product.totalQuantity) / totalQuantity) * 100)
            : 0;
          const averagePrice = Number(product.totalQuantity) > 0 
            ? (Number(product.totalRevenue) || 0) / Number(product.totalQuantity)
            : 0;

          return (
            <div key={product.drink_id || index} className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              {/* Rank Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRankColor(rank)} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {rank}
                </div>
              </div>

              {/* Product Image */}
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.drink_name || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Product Content */}
              <div className="p-4">
                {/* Product Name */}
                <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {product.drink_name || product.drink?.name || 'Sản phẩm không tên'}
                </h4>

                {/* Key Stats */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Doanh thu</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(Number(product.totalRevenue) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Đã bán</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Number(product.totalQuantity) || 0} đơn vị
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Giá TB</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(averagePrice)}
                    </span>
                  </div>
                </div>

                {/* Market Share Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Thị phần</span>
                    <span className="text-xs font-medium text-gray-700">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getRankColor(rank)} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rank Icon */}
                <div className="flex justify-center">
                  <span className="text-2xl">{getRankIcon(rank)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {data.topProducts.length}
            </div>
            <div className="text-sm text-blue-600 font-medium">Sản phẩm</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-700 mb-1">
              {data.topProducts.reduce((sum, p) => sum + (Number(p.totalQuantity) || 0), 0)}
            </div>
            <div className="text-sm text-green-600 font-medium">Tổng bán</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-700 mb-1">
              {formatCurrency(data.topProducts.reduce((sum, p) => sum + (Number(p.totalRevenue) || 0), 0))}
            </div>
            <div className="text-sm text-purple-600 font-medium">Tổng doanh thu</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-700 mb-1">
              {data.topProducts.length > 0 
                ? formatCurrency(data.topProducts.reduce((sum, p) => sum + (Number(p.totalRevenue) || 0), 0) / data.topProducts.length)
                : formatCurrency(0)
              }
            </div>
            <div className="text-sm text-orange-600 font-medium">TB/SP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopProductsSummary;
