require("dotenv").config();
const db = require("../models");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");

// Configure faker for Vietnamese locale
faker.locale = "vi";

// Vietnamese names and addresses
const vietnameseNames = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em",
  "Vũ Thị Phương", "Đặng Văn Giang", "Bùi Thị Hoa", "Phan Văn Ích", "Võ Thị Kim",
  "Đinh Văn Long", "Tôn Thị Mai", "Ngô Văn Nam", "Dương Thị Oanh", "Lý Văn Phúc",
  "Trịnh Thị Quỳnh", "Chu Văn Rồng", "Lương Thị Sinh", "Đỗ Văn Tài", "Hồ Thị Uyên"
];

const vietnameseAddresses = [
  "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "456 Lê Lợi, Quận 3, TP.HCM", 
  "789 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
  "321 Cách Mạng Tháng 8, Quận 10, TP.HCM",
  "654 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
  "987 Võ Văn Tần, Quận 3, TP.HCM",
  "147 Đinh Tiên Hoàng, Quận 1, TP.HCM",
  "258 Lý Tự Trọng, Quận 1, TP.HCM",
  "369 Nguyễn Du, Quận 1, TP.HCM",
  "741 Trần Hưng Đạo, Quận 5, TP.HCM"
];

const vietnamesePhoneNumbers = [
  "0901234567", "0912345678", "0923456789", "0934567890", "0945678901",
  "0956789012", "0967890123", "0978901234", "0989012345", "0990123456"
];

async function generateAdvancedSampleData() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ Database connected");

    // Clear existing data (optional - be careful in production!)
    console.log("🧹 Clearing existing data...");
    // Delete in correct order to respect foreign key constraints
    await db.Review.destroy({ where: {} });
    await db.LoyaltyPoint.destroy({ where: {} });
    await db.Favorite.destroy({ where: {} });
    await db.CartItem.destroy({ where: {} });
    await db.OrderItem.destroy({ where: {} });
    await db.Order.destroy({ where: {} });
    await db.Voucher.destroy({ where: {} });
    await db.UserVoucher.destroy({ where: {} });
    await db.User.destroy({ where: {} });

    // Get existing drinks and categories
    const drinks = await db.Drink.findAll();
    const categories = await db.Category.findAll();
    
    if (drinks.length === 0) {
      console.log("❌ No drinks found. Please run the basic seed first: npm run seed");
      process.exit(1);
    }

    console.log(`📦 Found ${drinks.length} drinks and ${categories.length} categories`);

    // Generate sample users with realistic Vietnamese data
    console.log("👥 Creating sample users...");
    const users = [];
    const userCount = 100; // Generate 100 users

    for (let i = 0; i < userCount; i++) {
      const user = {
        fullName: faker.helpers.arrayElement(vietnameseNames),
        username: faker.person.firstName().toLowerCase() + faker.number.int({ min: 100, max: 999 }),
        email: faker.internet.email(),
        password: await bcrypt.hash("password123", 10), // Default password for all users
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        phone: faker.helpers.arrayElement(vietnamesePhoneNumbers),
        address: faker.helpers.arrayElement(vietnameseAddresses),
        loyalty_points: faker.number.int({ min: 0, max: 2000 })
      };
      users.push(user);
    }

    const createdUsers = await db.User.bulkCreate(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Generate sample orders with realistic patterns
    console.log("📋 Creating sample orders...");
    const orders = [];
    const orderCount = 500; // Generate 500 orders
    const orderStatuses = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
    const paymentMethods = ['COD', 'BANKING', 'MOMO'];
    
    // Date range for orders (last 12 months)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const endDate = new Date();

    // Create realistic order distribution over time
    const monthlyOrderCounts = [45, 52, 38, 41, 48, 55, 62, 58, 44, 39, 47, 51]; // Last 12 months
    let orderIndex = 0;

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(startDate);
      monthStart.setMonth(monthStart.getMonth() + month);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthOrderCount = monthlyOrderCounts[month];
      
      for (let i = 0; i < monthOrderCount; i++) {
        const user = faker.helpers.arrayElement(createdUsers);
        const status = faker.helpers.arrayElement(orderStatuses);
        const paymentMethod = faker.helpers.arrayElement(paymentMethods);
        const orderDate = faker.date.between({ from: monthStart, to: monthEnd });
        
        // Generate order number
        const orderNumber = `UTE${String(orderIndex + 1).padStart(6, '0')}`;
        
        // Calculate subtotal and total with realistic pricing
        const subtotal = faker.number.float({ min: 30000, max: 800000, fractionDigits: 0 });
        const shippingFee = faker.number.float({ min: 0, max: 50000, fractionDigits: 0 });
        const total = subtotal + shippingFee;
        
        // Calculate loyalty points
        const loyaltyPointsUsed = faker.number.int({ min: 0, max: Math.floor(total / 1000) });
        const loyaltyPointsEarned = Math.floor(total / 10000); // 1 point per 10,000 VND
        
        const order = {
          user_id: user.id,
          order_number: orderNumber,
          status: status,
          payment_method: paymentMethod,
          subtotal: subtotal,
          shipping_fee: shippingFee,
          total: total,
          loyalty_points_used: loyaltyPointsUsed,
          loyalty_points_earned: loyaltyPointsEarned,
          shipping_address: faker.helpers.arrayElement(vietnameseAddresses),
          shipping_phone: faker.helpers.arrayElement(vietnamesePhoneNumbers),
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
          created_at: orderDate,
          updated_at: orderDate
        };

        // Add status-specific timestamps with realistic progression
        if (status === 'confirmed' || status === 'preparing' || status === 'shipping' || status === 'delivered') {
          order.confirmed_at = new Date(orderDate.getTime() + faker.number.int({ min: 5, max: 30 }) * 60000);
        }
        if (status === 'preparing' || status === 'shipping' || status === 'delivered') {
          order.preparing_at = new Date(order.confirmed_at.getTime() + faker.number.int({ min: 10, max: 60 }) * 60000);
        }
        if (status === 'shipping' || status === 'delivered') {
          order.shipping_at = new Date(order.preparing_at.getTime() + faker.number.int({ min: 15, max: 120 }) * 60000);
        }
        if (status === 'delivered') {
          order.delivered_at = new Date(order.shipping_at.getTime() + faker.number.int({ min: 30, max: 180 }) * 60000);
        }
        if (status === 'cancelled') {
          order.cancelled_at = new Date(orderDate.getTime() + faker.number.int({ min: 5, max: 60 }) * 60000);
          order.cancelled_reason = faker.helpers.arrayElement([
            'Khách hàng yêu cầu hủy',
            'Không liên lạc được',
            'Địa chỉ giao hàng không chính xác',
            'Sản phẩm hết hàng',
            'Thay đổi ý định'
          ]);
        }

        orders.push(order);
        orderIndex++;
      }
    }

    const createdOrders = await db.Order.bulkCreate(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);

    // Generate order items with realistic patterns
    console.log("🛒 Creating order items...");
    const orderItems = [];

    for (const order of createdOrders) {
      // Each order has 1-4 items (realistic for drink orders)
      const itemCount = faker.number.int({ min: 1, max: 4 });
      const selectedDrinks = faker.helpers.arrayElements(drinks, itemCount);
      
      for (const drink of selectedDrinks) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = drink.salePrice > 0 ? drink.salePrice : drink.price;
        
        const orderItem = {
          order_id: order.id,
          drink_id: drink.id,
          quantity: quantity,
          price: price,
          size: faker.helpers.arrayElement(['S', 'M', 'L']),
          ice_level: faker.helpers.arrayElement(['Không đá', 'Ít đá', 'Bình thường', 'Nhiều đá']),
          sugar_level: faker.helpers.arrayElement(['Không đường', 'Ít đường', 'Bình thường', 'Nhiều đường']),
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 })
        };
        
        orderItems.push(orderItem);
      }
    }

    const createdOrderItems = await db.OrderItem.bulkCreate(orderItems);
    console.log(`✅ Created ${createdOrderItems.length} order items`);

    // Update drink sold counts and views
    console.log("📊 Updating drink statistics...");
    for (const drink of drinks) {
      // Get total sold quantity for this drink from delivered orders
      const deliveredOrderItems = await db.OrderItem.findAll({
        include: [{
          model: db.Order,
          as: 'order',
          where: { status: 'delivered' }
        }],
        where: { drink_id: drink.id }
      });
      
      const totalSold = deliveredOrderItems.reduce((sum, item) => sum + item.quantity, 0);
      const views = faker.number.int({ min: 50, max: 1000 });
      
      await drink.update({ 
        sold: totalSold,
        views: views
      });
    }

    // Generate reviews with realistic patterns
    console.log("⭐ Creating sample reviews...");
    const reviews = [];
    const deliveredOrders = await db.Order.findAll({
      where: { status: 'delivered' },
      include: [{ model: db.OrderItem, as: 'orderItems' }]
    });

    // Track which user-drink combinations have already been reviewed
    const reviewedCombinations = new Set();

    for (const order of deliveredOrders.slice(0, 200)) { // Review 200 delivered orders
      for (const orderItem of order.orderItems) {
        const combinationKey = `${order.user_id}-${orderItem.drink_id}`;
        
        // Skip if this user has already reviewed this drink
        if (reviewedCombinations.has(combinationKey)) {
          continue;
        }
        
        if (faker.datatype.boolean({ probability: 0.6 })) { // 60% chance to review
          const rating = faker.number.int({ min: 1, max: 5 });
          const review = {
            user_id: order.user_id,
            drink_id: orderItem.drink_id,
            order_id: order.id,
            rating: rating,
            comment: faker.helpers.maybe(() => {
              const comments = [
                'Rất ngon, sẽ mua lại!',
                'Hương vị tuyệt vời',
                'Giao hàng nhanh, đóng gói cẩn thận',
                'Sản phẩm đúng như mô tả',
                'Giá cả hợp lý',
                'Chất lượng tốt',
                'Nhân viên thân thiện',
                'Đóng gói đẹp',
                'Vị ngon, đúng khẩu vị',
                'Sẽ giới thiệu cho bạn bè'
              ];
              return faker.helpers.arrayElement(comments);
            }, { probability: 0.8 }),
            created_at: new Date(order.delivered_at.getTime() + faker.number.int({ min: 1, max: 7 }) * 24 * 60 * 60 * 1000)
          };
          reviews.push(review);
          reviewedCombinations.add(combinationKey);
        }
      }
    }

    if (reviews.length > 0) {
      await db.Review.bulkCreate(reviews);
      console.log(`✅ Created ${reviews.length} reviews`);
    }

    // Generate loyalty point transactions
    console.log("🎯 Creating loyalty point transactions...");
    const loyaltyPoints = [];
    
    for (const order of createdOrders.filter(o => o.status === 'delivered')) {
      if (order.loyalty_points_earned > 0) {
        loyaltyPoints.push({
          user_id: order.user_id,
          points: order.loyalty_points_earned,
          amount: order.loyalty_points_earned,
          transaction_type: 'earned',
          description: `Tích lũy từ đơn hàng ${order.order_number}`,
          earned_from_order_id: order.id,
          created_at: order.delivered_at
        });
      }
      
      if (order.loyalty_points_used > 0) {
        loyaltyPoints.push({
          user_id: order.user_id,
          points: -order.loyalty_points_used,
          amount: order.loyalty_points_used,
          transaction_type: 'used',
          description: `Sử dụng cho đơn hàng ${order.order_number}`,
          used_in_order_id: order.id,
          created_at: order.created_at
        });
      }
    }

    if (loyaltyPoints.length > 0) {
      await db.LoyaltyPoint.bulkCreate(loyaltyPoints);
      console.log(`✅ Created ${loyaltyPoints.length} loyalty point transactions`);
    }

    // Generate favorites with realistic patterns
    console.log("❤️ Creating sample favorites...");
    const favorites = [];
    
    // Popular drinks (top 20% by sold count)
    const popularDrinks = drinks.sort((a, b) => b.sold - a.sold).slice(0, Math.ceil(drinks.length * 0.2));
    
    for (const user of createdUsers.slice(0, 50)) { // 50 users have favorites
      const favoriteCount = faker.number.int({ min: 1, max: 8 });
      const favoriteDrinks = faker.helpers.arrayElements(popularDrinks, favoriteCount);
      
      for (const drink of favoriteDrinks) {
        favorites.push({
          user_id: user.id,
          drink_id: drink.id,
          created_at: faker.date.between({ from: startDate, to: endDate })
        });
      }
    }

    if (favorites.length > 0) {
      await db.Favorite.bulkCreate(favorites);
      console.log(`✅ Created ${favorites.length} favorites`);
    }

    // Generate some cart items for active users
    console.log("🛍️ Creating sample cart items...");
    const cartItems = [];
    
    for (const user of createdUsers.slice(0, 20)) { // 20 users have items in cart
      const cartItemCount = faker.number.int({ min: 1, max: 3 });
      const cartDrinks = faker.helpers.arrayElements(drinks, cartItemCount);
      
      for (const drink of cartDrinks) {
        cartItems.push({
          user_id: user.id,
          drink_id: drink.id,
          quantity: faker.number.int({ min: 1, max: 2 }),
          created_at: faker.date.recent()
        });
      }
    }

    if (cartItems.length > 0) {
      await db.CartItem.bulkCreate(cartItems);
      console.log(`✅ Created ${cartItems.length} cart items`);
    }

    // Print comprehensive summary statistics
    console.log("\n📈 Advanced Sample Data Summary:");
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📋 Orders: ${createdOrders.length}`);
    console.log(`🛒 Order Items: ${createdOrderItems.length}`);
    console.log(`⭐ Reviews: ${reviews.length}`);
    console.log(`🎯 Loyalty Points: ${loyaltyPoints.length}`);
    console.log(`❤️ Favorites: ${favorites.length}`);
    console.log(`🛍️ Cart Items: ${cartItems.length}`);
    
    // Order status breakdown
    const statusCounts = {};
    for (const order of createdOrders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }
    console.log("\n📊 Order Status Breakdown:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    // Payment method breakdown
    const paymentCounts = {};
    for (const order of createdOrders) {
      paymentCounts[order.payment_method] = (paymentCounts[order.payment_method] || 0) + 1;
    }
    console.log("\n💳 Payment Method Breakdown:");
    Object.entries(paymentCounts).forEach(([method, count]) => {
      console.log(`   ${method}: ${count}`);
    });

    // Monthly order distribution
    console.log("\n📅 Monthly Order Distribution (Last 12 months):");
    monthlyOrderCounts.forEach((count, index) => {
      const month = new Date();
      month.setMonth(month.getMonth() - 11 + index);
      console.log(`   ${month.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}: ${count} orders`);
    });

    console.log("\n✅ Advanced sample data generation completed successfully!");
    console.log("🎉 Your statistics dashboard should now have plenty of data to display!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error generating advanced sample data:", error);
    process.exit(1);
  }
}

generateAdvancedSampleData();
