const { encryptCode } = require("../middleware/auth");
const userSchema = require("../model/userSchema");
const bcrypt = require("bcryptjs");
module.exports = {
  // new user
  newUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      // email is exist or not
      const checkEmailExist = await userSchema.find({ email });
      if (checkEmailExist.length > 0) {
        res.status(400).json({ err: "This email is already exist" });
      } else {
        // password  hassing
        const hashPassword = encryptCode(password);
        // insert new user
        await userSchema.create({
          name,
          email,
          password: hashPassword,
        });
        res.status(200).json({
          message: "Register successfully, you can login now ",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
  // get all users
  getAllusers: async (req, res) => {
    try {
      // fetch all users
      let response = await userSchema.find({}, { password: 0 });
      res.status(200).json({
        message: `welcome to ${req.name} you see list of users`,
        response,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
