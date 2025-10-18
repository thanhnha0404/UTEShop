import React, { useState, useEffect, useCallback } from 'react';
import StatisticsCard from '../components/StatisticsCard';
import StatisticsChart from '../components/StatisticsChart';
import DateRangePicker from '../components/DateRangePicker';
import OrdersTable from '../components/OrdersTable';
import TopProductsTable from '../components/TopProductsTable';
// Import new interactive chart components
import RevenueChart from '../components/charts/RevenueChart';
import OrderStatusChart from '../components/charts/OrderStatusChart';
import CustomersChart from '../components/charts/CustomersChart';
import TopProductsChart from '../components/charts/TopProductsChart';
// Import new summary components
import CashFlowSummary from '../components/CashFlowSummary';
import TopProductsSummary from '../components/TopProductsSummary';
import {
  getDashboardOverview,
  getRevenueStatistics,
  getCompletedOrders,
  getCashFlowAnalysis,
  getNewCustomersCount,
  getTopSellingProducts,
  getAllOrdersForStatus
} from '../services/statistics.services';

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [completedOrders, setCompletedOrders] = useState(null);
  const [allOrders, setAllOrders] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [newCustomers, setNewCustomers] = useState(null);
  const [topProducts, setTopProducts] = useState(null);

  // Icons for statistics cards
  const icons = {
    revenue: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    orders: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    customers: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    pending: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    console.log('Loading statistics data with dates:', { startDate, endDate });
    
    try {
      const [
        overviewRes,
        revenueRes,
        ordersRes,
        allOrdersRes,
        cashFlowRes,
        customersRes,
        productsRes
      ] = await Promise.all([
        getDashboardOverview(startDate, endDate),
        getRevenueStatistics('day', startDate, endDate),
        getCompletedOrders(currentPage, 10, startDate, endDate),
        getAllOrdersForStatus(startDate, endDate),
        getCashFlowAnalysis(startDate, endDate),
        getNewCustomersCount('month', startDate, endDate),
        getTopSellingProducts(startDate, endDate, 10)
      ]);

      console.log('API Responses:', {
        overview: overviewRes,
        revenue: revenueRes,
        orders: ordersRes,
        allOrders: allOrdersRes,
        cashFlow: cashFlowRes,
        customers: customersRes,
        products: productsRes
      });

      if (overviewRes.success) {
        setOverview(overviewRes.data.data);
      } else {
        console.error('Overview failed:', overviewRes.error);
      }
      if (revenueRes.success) {
        setRevenueStats(revenueRes.data.data);
      } else {
        console.error('Revenue failed:', revenueRes.error);
      }
      if (ordersRes.success) {
        setCompletedOrders(ordersRes.data.data);
      } else {
        console.error('Orders failed:', ordersRes.error);
      }
      if (allOrdersRes.success) {
        setAllOrders(allOrdersRes.data.data);
      } else {
        console.error('All orders failed:', allOrdersRes.error);
      }
      if (cashFlowRes.success) {
        setCashFlow(cashFlowRes.data.data);
      } else {
        console.error('Cash flow failed:', cashFlowRes.error);
      }
      if (customersRes.success) {
        setNewCustomers(customersRes.data.data);
      } else {
        console.error('Customers failed:', customersRes.error);
      }
      if (productsRes.success) {
        console.log('Top products data:', productsRes.data.data);
        setTopProducts(productsRes.data.data);
      } else {
        console.error('Products failed:', productsRes.error);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, currentPage]);

  useEffect(() => {
    // Test API connection first
    const testConnection = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/statistics/test');
        const data = await response.json();
        console.log('API test response:', data);
      } catch (error) {
        console.error('API test failed:', error);
      }
    };
    
    testConnection();
    loadData();
  }, [loadData]);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thống kê & Doanh thu</h1>
          <p className="text-gray-600">Theo dõi hiệu suất kinh doanh và phân tích dữ liệu</p>
        </div>

        {/* Date Range Picker */}
        <div className="mb-8">
          <DateRangePicker
            onDateChange={handleDateChange}
            defaultStartDate={startDate}
            defaultEndDate={endDate}
          />
        </div>

        {/* Overview Cards */}
        {overview ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatisticsCard
              title="Tổng giá trị đơn hàng"
              value={overview.totalRevenue}
              subtitle="Đơn hàng đã giao"
              icon={icons.revenue}
              color="green"
            />
            <StatisticsCard
              title="Tổng đơn hàng"
              value={overview.totalOrders}
              subtitle="Đơn hàng đã hoàn thành"
              icon={icons.orders}
              color="blue"
            />
            <StatisticsCard
              title="Khách hàng mới"
              value={overview.newCustomers}
              subtitle="Trong khoảng thời gian đã chọn"
              icon={icons.customers}
              color="purple"
            />
            <StatisticsCard
              title="Đơn hàng chờ xử lý"
              value={overview.pendingOrders}
              subtitle="Chưa giao hàng"
              icon={icons.pending}
              color="yellow"
            />
          </div>
        ) : !loading && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center mb-8">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dữ liệu</h3>
            <p className="text-gray-500 mb-4">Không tìm thấy dữ liệu thống kê cho khoảng thời gian đã chọn.</p>
            <div className="text-sm text-gray-400">
              <p>• Đảm bảo bạn đã đăng nhập</p>
              <p>• Kiểm tra kết nối mạng</p>
              <p>• Thử chọn khoảng thời gian khác</p>
            </div>
          </div>
        )}

        {/* Interactive Charts Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Biểu đồ tương tác</h2>
          
          {/* Revenue and Order Status Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            {revenueStats && (
              <RevenueChart
                data={revenueStats.statistics}
                title="Biểu đồ doanh thu theo thời gian"
              />
            )}

            {/* Order Status Chart */}
            {allOrders && (
              <OrderStatusChart
                data={allOrders}
                title="Phân bố trạng thái đơn hàng"
              />
            )}
          </div>

          {/* Cash Flow Summary */}
          {cashFlow && (
            <div className="mb-8">
              <CashFlowSummary
                data={cashFlow}
                title="Phân tích dòng tiền"
              />
            </div>
          )}

          {/* Customers Chart */}
          {newCustomers && (
            <div className="mb-8">
              <CustomersChart
                data={newCustomers}
                title="Thống kê khách hàng"
              />
            </div>
          )}

          {/* Top Products Summary */}
          <div className="mb-8">
            {console.log('Rendering TopProductsSummary with data:', topProducts)}
            <TopProductsSummary
              data={topProducts}
              title="Top 10 sản phẩm bán chạy"
            />
          </div>
        </div>

        {/* Completed Orders Table */}
        {completedOrders && (
          <OrdersTable
            orders={completedOrders.orders}
            pagination={completedOrders.pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
