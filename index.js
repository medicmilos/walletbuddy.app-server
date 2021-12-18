const express = require("express");
const PORT = process.env.PORT || 4000;
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./config/db");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

//configure database and mongoose
mongoose.set("useCreateIndex", true);
mongoose
  .connect(config.database, { useNewUrlParser: true })
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log({ database_error: err });
  });
// db configuaration ends here
//registering cors
app.use(cors());
//configure body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//configure body-parser ends here

app.use(morgan("dev")); // configire morgan

// define first route
app.get("/", (req, res) => {
  console.log("Hello MEVN Soldier");
});

const userRoutes = require("./api/user/route/user");
app.use("/user", userRoutes);

const boardsRoutes = require("./api/boards/route/boards");
app.use("/boards", boardsRoutes);

const transactionsRoutes = require("./api/transactions/route/transactions");
app.use("/transactions", transactionsRoutes);

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
