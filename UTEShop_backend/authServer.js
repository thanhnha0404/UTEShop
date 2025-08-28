const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

db.sequelize
  .authenticate()
  .then(() => console.log("✅ Auth server DB connection OK"))
  .catch((err) => console.log("❌ Auth server DB connection error:", err));

app.listen(PORT, HOST, () => {
  console.log(`🚀 Auth Server at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
});


