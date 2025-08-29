const express = require("express");
const bodyParser = require("body-parser");
const db = require("./models");
const cors = require("cors");
const userRoutes = require("./routes/user.routes");

const app = express();
const PORT = 3001;
app.use(cors());


app.use(bodyParser.json());

// API user
app.use("/users", userRoutes);

// Sync DB
db.sequelize.sync({ force: false })
  .then(() => console.log("✅ Database sync thành công"))
  .catch(err => console.log("❌ Sync lỗi:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
