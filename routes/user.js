const express = require("express");
const userCntrl = require("../controllers/user");
const auth = require("../middleware/auth");

const userRouter = express();

userRouter.post("/register", auth.registerValidator, userCntrl.newUser);
userRouter.get("/getAllusers", auth.verifyAccessToken, userCntrl.getAllusers);

module.exports = userRouter;
