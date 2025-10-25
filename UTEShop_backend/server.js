const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const db = require("./models");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const drinkRoutes = require("./routes/drink.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const voucherRoutes = require("./routes/voucher.routes");
const checkoutRoutes = require("./routes/checkout.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const loyaltyRoutes = require("./routes/loyalty.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const statisticsRoutes = require("./routes/statistics.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.use(bodyParser.json());

// CORS cho frontend (gửi cookie)
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}));

// Cấu hình session
app.use(session({
  secret: "uteshop_secret_key", // Đổi thành chuỗi bí mật mạnh hơn khi deploy
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 60 * 1000, // 10 phút
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // Chỉ secure trong production
  },
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/drinks", drinkRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/notifications", notificationRoutes);

// Sync DB
db.sequelize.sync({ force: false })
  .then(() => console.log("✅ Database sync thành công"))
  .catch(err => console.log("❌ Sync lỗi:", err));

// Tự động xác nhận đơn sau 5 phút: chạy mỗi phút
const { autoConfirmOrders } = require("./controllers/order.controller");
setInterval(() => {
  autoConfirmOrders().catch((err) => console.error("Auto confirm error:", err));
}, 60 * 1000);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room: user_${userId}`);
  });

  // User leaves their personal room
  socket.on('leave-user-room', (userId) => {
    socket.leave(`user_${userId}`);
    console.log(`👤 User ${userId} left room: user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available globally for other modules
global.io = io;

server.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});