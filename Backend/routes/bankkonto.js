const express = require("express");
const router = express.Router();
const { Bankkonto, Bruker } = require("../models");

router.post("/create", async (req, res) => {
  try {
    const { brukerId } = req.body;
    const user = await Bruker.findByPk(brukerId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const newAccount = await Bankkonto.create({ brukerId });
    res.json(newAccount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/balance/:kontonummer", async (req, res) => {
  try {
    const { kontonummer } = req.params;
    const account = await Bankkonto.findOne({ where: { kontonummer } });
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json({ balance: account.saldo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
