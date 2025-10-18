const { Order, OrderItem, Drink, User, sequelize } = require("../models");
const { Op } = require("sequelize");

// Get revenue statistics by period (day, month, year)
const getRevenueStatistics = async (req, res) => {
  try {
    const { period = 'day', startDate, endDate } = req.query;
    
    let dateFormat, groupBy;
    let whereClause = { status: 'delivered' };
    
    // Set date range
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else {
      // Default to last 30 days if no date range provided
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      whereClause.created_at = {
        [Op.gte]: thirtyDaysAgo
      };
    }

    // Set date format based on period
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        break;
      case 'year':
        dateFormat = '%Y';
        groupBy = 'YEAR(created_at)';
        break;
      default:
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
    }

    const revenueStats = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), dateFormat), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('total')), 'averageOrderValue']
      ],
      where: whereClause,
      group: [sequelize.literal(groupBy)],
      order: [[sequelize.literal('period'), 'ASC']],
      raw: true
    });

    // Calculate totals
    const totals = await Order.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
        [sequelize.fn('AVG', sequelize.col('total')), 'averageOrderValue']
      ],
      where: whereClause,
      raw: true
    });

    res.json({
      success: true,
      data: {
        statistics: revenueStats,
        totals: totals,
        period: period
      }
    });
  } catch (error) {
    console.error('Revenue statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê doanh thu',
      error: error.message
    });
  }
};

// Get completed orders list
const getCompletedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { status: 'delivered' };
    
    if (startDate && endDate) {
      whereClause.delivered_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Drink,
              as: 'drink',
              attributes: ['id', 'name', 'image_url']
            }
          ]
        }
      ],
      order: [['delivered_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalOrders: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Completed orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng đã hoàn thành',
      error: error.message
    });
  }
};

// Get cash flow analysis (pending vs delivered orders)
const getCashFlowAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get pending orders (orders that are not delivered)
    const pendingOrders = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount']
      ],
      where: {
        ...whereClause,
        status: {
          [Op.in]: ['pending', 'confirmed', 'preparing', 'shipping']
        }
      },
      raw: true
    });

    // Get delivered orders
    const deliveredOrders = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount']
      ],
      where: {
        ...whereClause,
        status: 'delivered'
      },
      raw: true
    });

    // Get wallet balance from loyalty points (assuming this represents wallet balance)
    const walletBalance = await User.sum('loyalty_points', {
      where: whereClause
    });

    // Convert string values to numbers
    const pendingData = pendingOrders[0] || { orderCount: '0', totalAmount: '0' };
    const deliveredData = deliveredOrders[0] || { orderCount: '0', totalAmount: '0' };
    
    res.json({
      success: true,
      data: {
        pendingOrders: {
          count: parseInt(pendingData.orderCount) || 0,
          totalAmount: parseFloat(pendingData.totalAmount) || 0
        },
        deliveredOrders: {
          count: parseInt(deliveredData.orderCount) || 0,
          totalAmount: parseFloat(deliveredData.totalAmount) || 0
        },
        walletBalance: parseFloat(walletBalance) || 0,
        netCashFlow: (parseFloat(deliveredData.totalAmount) || 0) - (parseFloat(pendingData.totalAmount) || 0)
      }
    });
  } catch (error) {
    console.error('Cash flow analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phân tích dòng tiền',
      error: error.message
    });
  }
};

// Get new customers count
const getNewCustomersCount = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    // User model has timestamps: false, so we can't filter by created_at
    // For now, return total user count as new customers
    // TODO: Add created_at field to User model if needed for proper date filtering
    
    const newCustomersCount = await User.count();

    // Get total customers count
    const totalCustomersCount = await User.count();

    // Get customers with orders (active customers)
    const activeCustomersCount = await User.count({
      include: [
        {
          model: Order,
          as: 'orders',
          where: { status: 'delivered' },
          required: true
        }
      ]
    });

    res.json({
      success: true,
      data: {
        newCustomers: newCustomersCount,
        totalCustomers: totalCustomersCount,
        activeCustomers: activeCustomersCount,
        period: period
      }
    });
  } catch (error) {
    console.error('New customers count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy số lượng khách hàng mới',
      error: error.message
    });
  }
};

// Get top 10 best-selling products
const getTopSellingProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause['$order.created_at$'] = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Use raw SQL query to avoid GROUP BY issues
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND o.created_at BETWEEN '${startDate}' AND '${endDate}'`;
    }

    const query = `
      SELECT 
        oi.drink_id,
        d.id as drink_id,
        d.name as drink_name,
        d.image_url,
        d.price,
        SUM(oi.quantity) as totalQuantity,
        SUM(oi.quantity * oi.price) as totalRevenue,
        COUNT(oi.id) as orderCount
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      INNER JOIN drinks d ON oi.drink_id = d.id
      WHERE o.status = 'delivered' ${dateFilter}
      GROUP BY oi.drink_id, d.id, d.name, d.image_url, d.price
      ORDER BY totalQuantity DESC
      LIMIT ${parseInt(limit)}
    `;

    const topProducts = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        topProducts,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Top selling products error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm bán chạy',
      error: error.message
    });
  }
};

// Get dashboard overview statistics
const getDashboardOverview = async (req, res) => {
  try {
    console.log('Dashboard overview request:', req.query);
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      whereClause.created_at = {
        [Op.gte]: thirtyDaysAgo
      };
    }
    
    console.log('Where clause:', whereClause);

    // Get total revenue
    const totalRevenue = await Order.sum('total', {
      where: {
        ...whereClause,
        status: 'delivered'
      }
    });

    // Get total orders
    const totalOrders = await Order.count({
      where: {
        ...whereClause,
        status: 'delivered'
      }
    });

    // Get new customers (User model doesn't have created_at, so we'll get total count)
    const newCustomers = await User.count();

    // Get average order value
    const avgOrderValue = await Order.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('total')), 'averageValue']
      ],
      where: {
        ...whereClause,
        status: 'delivered'
      },
      raw: true
    });

    // Get pending orders count
    const pendingOrders = await Order.count({
      where: {
        ...whereClause,
        status: {
          [Op.in]: ['pending', 'confirmed', 'preparing', 'shipping']
        }
      }
    });

    const result = {
      totalRevenue: totalRevenue || 0,
      totalOrders: totalOrders || 0,
      newCustomers: newCustomers || 0,
      averageOrderValue: avgOrderValue?.averageValue || 0,
      pendingOrders: pendingOrders || 0,
      period: startDate && endDate ? 'custom' : 'last_30_days'
    };
    
    console.log('Dashboard overview result:', result);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan dashboard',
      error: error.message
    });
  }
};

// Get all orders for status distribution chart
const getAllOrdersForStatus = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      whereClause.created_at = {
        [Op.gte]: thirtyDaysAgo
      };
    }

    const orders = await Order.findAll({
      where: whereClause,
      attributes: ['id', 'status', 'total', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        orders: orders,
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

module.exports = {
  getRevenueStatistics,
  getCompletedOrders,
  getCashFlowAnalysis,
  getNewCustomersCount,
  getTopSellingProducts,
  getDashboardOverview,
  getAllOrdersForStatus
};
