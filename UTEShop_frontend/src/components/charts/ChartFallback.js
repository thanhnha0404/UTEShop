import React from 'react';

// Fallback chart component when Chart.js is not installed
const ChartFallback = ({ title, message = "Cài đặt Chart.js để xem biểu đồ tương tác" }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-center mb-2">{message}</p>
        <div className="text-sm text-gray-400 text-center">
          <p>Chạy lệnh: <code className="bg-gray-100 px-2 py-1 rounded">npm install chart.js react-chartjs-2</code></p>
        </div>
      </div>
    </div>
  );
};

export default ChartFallback;
