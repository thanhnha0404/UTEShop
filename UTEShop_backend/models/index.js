const { sequelize } = require("../config/db.config");
const User = require("./user.model");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công");
  } catch (err) {
    console.error("❌ Lỗi kết nối MySQL:", err);
  }
})();


const db = {};
db.sequelize = sequelize;
db.User = User;

module.exports = db;
