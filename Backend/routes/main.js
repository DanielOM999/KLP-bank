const express = require("express");
const router = express.Router();

const homeRoutes = require("./home");
const userRoutes = require("./users");
const accountRoutes = require("./bankkonto");
const transactionRoutes = require("./transaction");

router.use("/home", homeRoutes);
router.use("/users", userRoutes);
router.use("/account", accountRoutes);
router.use("/transaction", transactionRoutes);

module.exports = router;
