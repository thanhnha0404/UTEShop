import React, { useState } from 'react';

const DateRangePicker = ({ onDateChange, defaultStartDate, defaultEndDate }) => {
  const [startDate, setStartDate] = useState(defaultStartDate || '');
  const [endDate, setEndDate] = useState(defaultEndDate || '');

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    onDateChange(value, endDate);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
    onDateChange(startDate, value);
  };

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const startStr = formatDate(start);
    const endStr = formatDate(end);
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateChange(startStr, endStr);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn khoảng thời gian</h3>
      
      {/* Quick range buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setQuickRange(7)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          7 ngày
        </button>
        <button
          onClick={() => setQuickRange(30)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          30 ngày
        </button>
        <button
          onClick={() => setQuickRange(90)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          90 ngày
        </button>
        <button
          onClick={() => setQuickRange(365)}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          1 năm
        </button>
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
