const bcrypt = require("bcryptjs");

const AuthController = {
  verify: async (req, res) => {
    const { email, name } = req.body;

  },
  register: async (req, res) => {},
};

module.exports = AuthController;
