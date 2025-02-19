const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
const path = require("path");
const syncDatabase = require("./sync");

const passport = require("passport");
require("./config/passport-config");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));


app.use(session({
  secret: "SECRETKEY",
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

const main = require("./routes/main");

syncDatabase()
  .then(() => {
    console.log("Starting the server...");
    app.use("/api", main);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error syncing database, server not started:", error);
  });
