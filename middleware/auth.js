const Joi = require("joi");
const json = require("jsonwebtoken");
const userSchema = require("../model/userSchema");
const crypto = require("crypto");
require("dotenv").config();
module.exports = {
  registerValidator: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        name: Joi.string().required().label("Username"),
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
      });
      const response = Schema.validate(req.body);
      if (response.error) {
        res.status(400).json({ err: response.error.message });
      } else {
        next();
      }
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  },
  loginValidator: async (req, res, next) => {
    try {
      const Schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password"),
      });
      const response = Schema.validate(req.body);
      if (response.error) {
        res.status(400).json({ err: response.error.message });
      } else {
        next();
      }
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  },
  verifyAccessToken: async (req, res, next) => {
    try {
      let token = req.headers["authorization"].split(" ");
      let data = json.verify(token[1], process.env.accessKey);
      let checkUser = await userSchema.findById(data.id);
      if (checkUser) {
        req.name = checkUser.name;
        next();
      } else {
        res.status(401).json({ message: "Token is invalid" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  encryptCode: (data) => {
    let cipher = crypto.createCipheriv(process.env.cryptoAlg, process.env.cryptoKey, process.env.cryptoIv); 
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  }, 
  decryptCode: (encrypted) => {
    let decipher = crypto.createDecipheriv(process.env.cryptoAlg, process.env.cryptoKey, process.env.cryptoIv); 
    return decipher.update(encrypted, 'hex','utf-8') + decipher.final('utf-8');
  },
};
