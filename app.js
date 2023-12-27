const express = require("express");
require("dotenv").config();
require("./config/db");
const mainRout = require("./routes/index");
var randomstring = require("randomstring");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// backend apis
app.use("/api", mainRout);

const port = process.env.port || 4000;
app.listen(port, () => {
  console.log(randomstring.generate({ readable:false}));
  console.log(`server is started on this ${port}`);
});
