const userSchema = require("../model/userSchema");
var randomstring = require("randomstring");
const authSchema = require("../model/authSchema");
const json = require("jsonwebtoken");
const { encryptCode,decryptCode } = require("../middleware/auth");
require("dotenv").config()

module.exports = {
  // get user credentails
  getMyCredentail: async (req, res) => {
    const { email, password } = req.body;
    try {
      // check email is exist or not
      const checkEmailExist = await userSchema.findOne({ email });
      if (checkEmailExist) {
        // compare password in a plan
        if (checkEmailExist.password==encryptCode(password)) {
          // check this user have auth credentails or not
          let checkauth = await authSchema.findOne({userid: checkEmailExist.id,});
          // if user credentials do not exist then this block will create new  user auth credentials
          if (!checkauth) {
            let clientId = randomstring.generate(10);
            let clientSecrate = randomstring.generate(15);
            checkauth = await authSchema.create({
              userid: checkEmailExist.id,
              clientId:encryptCode(clientId),
              clientSecrate:encryptCode(clientSecrate),
              grantType: ["authorization_code","refresh_token","client_credentials","device_code","password",]
            });
          }
          let response={
            clientId: decryptCode(checkauth.clientId),
            clientSecrate: decryptCode(checkauth.clientSecrate),
            scope: checkauth.grantType,
          }
          res.status(200).json({message: "Your credentials",response});
        } else {
          res.status(400).json({ err: "password is not matched" });
        }
      } else {
        res.status(400).json({ err: "email is not exist" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // get authorize code
  getAuthorizationCode: async (req, res) => {
    try {
      const { clientId, clientSecrate, grantType } = req.body;
      if (grantType == "authorization_code") {
        // check the client id and client security key 
        let checkauth = await authSchema.findOne({clientId: encryptCode(clientId),clientSecrate: encryptCode(clientSecrate),});
        if (checkauth) {
          // generate  authorization code
          let authCode = randomstring.generate(30);
          // genarate encrypt code for authorization code
          const hashAuthCode = encryptCode(authCode)
          await authSchema.findByIdAndUpdate(checkauth.id, {authCode: hashAuthCode,});
          res.status(200).json({ message: "Your authCode", authCode });
        } else {
          res.status(400).json({ message: "Incorrect clientId and clientSecrate" });
        }
      } else {
        res.status(400).json({ message: "Invalid grantType" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // verify authorze code
  verifyAuthCode: async (req, res) => {
    try {
      const { clientId, clientSecrate, authCode, grantType } = req.body;
      if (grantType == "authorization_code") {
        // check the client id and client security key
        let checkauth = await authSchema.findOne({ clientId:encryptCode(clientId),clientSecrate:encryptCode(clientSecrate) });
        if (checkauth) {
          // compare authorize code
          if (checkauth.authCode==encryptCode(authCode)) {
            let accessToken = json.sign({ id: checkauth.userid},process.env.accessKey,{ expiresIn: "2m" });
            res.json({ message: "Get accessToken", accessToken });
          } else {
            res.status(400).json({ message: "Incorrect authorize code" });
          }
        } else {
          res.status(400).json({ message: "Incorrect clientId and clientSecrate" });
        }
      } else {
        res.status(400).json({ message: "Invalid grantType" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // generate refresh token
  getRefreshToken: async (req, res) => {
    try {
      const { clientId, clientSecrate, grantType } = req.body;
      if (grantType == "refresh_token") {
        let checkauth = await authSchema.findOne({ clientId:encryptCode(clientId),clientSecrate:encryptCode(clientSecrate) });
        if (checkauth) {
          // generate access token
          let accessToken = json.sign({ id: checkauth.userid },process.env.accessKey,{ expiresIn: "2m" });
          // generate refresh token
          let refreshCode=encryptCode(checkauth.userid.toString())
          let refreshToken = json.sign({ code: refreshCode },process.env.refreshKey,{ expiresIn: "2d" });
          await authSchema.findByIdAndUpdate(checkauth.id, { refreshToken: refreshCode });
          res.status(200).json({ message: "Get tokens", accessToken, refreshToken });
        } else {
          res.status(400).json({ message: "Incorrect clientId and clientSecrate" });
        }
      } else {
        res.status(400).json({ message: "Invalid grantType" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // verify the refresh token to get the access token
  verifyRefreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      // check refresh token exist or not
      let data = json.verify(refreshToken, process.env.refreshKey);

      let checkauth = await authSchema.findOne({ refreshToken:data.code });
      if (checkauth) {
        // generate new access token
        let accessToken = json.sign({ id: decryptCode(data.code) }, process.env.accessKey, {expiresIn: "2m",});
        res.status(200).json({message: "A refresh token is verified successfully",accessToken,});
      } else {
        res.status(400).json({ message: "Incorrect refresh token" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // verify user client credentails
  verifyClientCredentials: async (req, res) => {
    try {
      const { clientId, clientSecrate, grantType } = req.body;
      if (grantType == "client_credentials") {
        // check the client id and client security key
        let checkauth = await authSchema.findOne({ clientId:encryptCode(clientId),clientSecrate:encryptCode(clientSecrate) });
        if (checkauth) {
          let accessToken = json.sign({ id: checkauth.userid },process.env.accessKey,{ expiresIn: "2m" });
          res.status(200).json({ message: "Get accessToken", accessToken });
        } else {
          res.status(400).json({message: "Incorrect clientId and clients secrate",});
        }
      } else {
        res.status(400).json({ message: "Invalid grantType" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // genarate device code
  getDeviceCode: async (req, res) => {
    try {
      const { clientId, clientSecrate, grantType } = req.body;
      if (grantType == "device_code") {
        // check the client id and client security key 
        let checkauth = await authSchema.findOne({clientId:encryptCode(clientId),clientSecrate:encryptCode(clientSecrate) });
        if (checkauth) {
          // generate usercode and devicecode
          let userCode = randomstring.generate(20);
          let deviceCode = randomstring.generate(20);
          await authSchema.findByIdAndUpdate(checkauth.id, {userCode:encryptCode(userCode),deviceCode: encryptCode(deviceCode),});
          res.status(200).json({ message: "Get your device code", userCode, deviceCode });
        } else {
          res.status(400).json({ message: "Incorrect clientId and clientSecrate" });
        }
      } else {
        res.status(400).json({ message: "Invalid grantType" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // verify device code and user code
  verifyDeviceCode: async (req, res) => {
    try {
      const { userCode, deviceCode, grantType } = req.body;
      if (grantType == "device_code") {
        // check the user code and scope
        let checkauth = await authSchema.findOne({userCode:encryptCode(userCode),});
        if (checkauth) {
          if (checkauth.deviceCode==encryptCode(deviceCode)) {
            // genarate access token
            let accessToken = json.sign({ id: checkauth.userid },process.env.accessKey,{ expiresIn: "2m" });
            res.status(200).json({ message: "Get accessToken", accessToken });
          } else {
            res.status(400).json({ message: "Incorrect device code" });
          }
        } else {
          res.status(400).json({ message: "Incorrect user code" });
        }
      } else {
        res.status(400).json({ message: "Invalid scope" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // get token using password grant type
  passwordGrantType: async (req, res) => {
    try {
      const { email, password, clientId, grantType } = req.body;
      // check email is exist or not
      const checkEmailExist = await userSchema.findOne({ email });
      if (grantType == "password") {
        if (checkEmailExist) {
          // compare password in a plan
          if (checkEmailExist.password==encryptCode(password)) {
            let checkauth = await authSchema.findOne({clientId:encryptCode(clientId),userid: checkEmailExist.id,});
            if (checkauth) {
              // genarate access token
              let accessToken = json.sign({ id: checkauth.userid },process.env.accessKey,{ expiresIn: "2m" });
              res.status(200).json({ message: "Get accessToken", accessToken });
            } else {
              res.status(400).json({ message: "Incorrect clientId" });
            }
          } else {
            res.status(400).json({ message: "Incorrect password" });
          }
        } else {
          res.status(400).json({ message: "Incorrect email" });
        }
      } else {
        res.status(400).json({ message: "Invalid grantType" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
