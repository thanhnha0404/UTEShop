import React from 'react';

const StatisticsChart = ({ data, type = 'line', title, height = '300px' }) => {

  const renderLineChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => parseFloat(item.totalRevenue || 0)));
    const minValue = Math.min(...data.map(item => parseFloat(item.totalRevenue || 0)));

    return (
      <div className="relative" style={{ height }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1="0"
              y1={`${ratio * 100}%`}
              x2="100%"
              y2={`${ratio * 100}%`}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((parseFloat(item.totalRevenue || 0) - minValue) / (maxValue - minValue)) * 100;
              return `${x}%,${y}%`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((parseFloat(item.totalRevenue || 0) - minValue) / (maxValue - minValue)) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              {item.period}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Không có dữ liệu để hiển thị
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => parseFloat(item.totalQuantity || 0)));

    return (
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => {
          const height = (parseFloat(item.totalQuantity || 0) / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {item.drink?.name || 'N/A'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ height }}>
        {type === 'line' ? renderLineChart() : renderBarChart()}
      </div>
    </div>
  );
};

export default StatisticsChart;
