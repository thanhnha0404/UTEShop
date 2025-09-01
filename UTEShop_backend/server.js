const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const db = require("./models");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = 8080;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

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
  },
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Sync DB
db.sequelize.sync({ force: false })
  .then(() => console.log("✅ Database sync thành công"))
  .catch(err => console.log("❌ Sync lỗi:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
