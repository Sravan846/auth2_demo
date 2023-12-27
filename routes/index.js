const express = require("express");
const userRouter = require("./user");
const userAuthRouter = require("./userAuth");

const mainRouter = express();

// user module apis
mainRouter.use("/user", userRouter);
// auth module apis
mainRouter.use("/auth", userAuthRouter);

module.exports = mainRouter;
