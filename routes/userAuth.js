const express = require("express");
const userAuthCntrl = require("../controllers/userAuth");
const auth = require("../middleware/auth");

const userRouter = express();

userRouter.post("/myCredentail",auth.loginValidator,userAuthCntrl.getMyCredentail);
userRouter.post("/getAuthorizationCode", userAuthCntrl.getAuthorizationCode);
userRouter.post("/verifyAuthCode",userAuthCntrl.verifyAuthCode);
userRouter.post("/getRefreshToken",userAuthCntrl.getRefreshToken);
userRouter.post("/verifyRefreshToken",userAuthCntrl.verifyRefreshToken);
userRouter.post("/verifyClientCredentials",userAuthCntrl.verifyClientCredentials);
userRouter.post("/getDeviceCode",userAuthCntrl.getDeviceCode);
userRouter.post("/verifyDeviceCode",userAuthCntrl.verifyDeviceCode);
userRouter.post("/passwordGrantType",userAuthCntrl.passwordGrantType);

module.exports = userRouter;
