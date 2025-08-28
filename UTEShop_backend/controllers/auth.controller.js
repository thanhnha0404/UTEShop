const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ where: { username, password } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = { id: user.id, username: user.username };
    const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Login error", error: err?.message || String(err) });
  }
};


