const express = require("express");
const router = express.Router();
const { Bankkonto, Transaksjon } = require("../models");

router.post("/deposit", async (req, res) => {
  try {
    const { kontonummer, belop } = req.body;
    const account = await Bankkonto.findOne({ where: { kontonummer } });
    if (!account) return res.status(404).json({ error: "Account not found" });
    account.saldo = parseFloat(account.saldo) + parseFloat(belop);
    await account.save();
    await Transaksjon.create({ kontonummer, type: 'deposit', belop });
    res.json({ message: "Deposit successful", account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/withdraw", async (req, res) => {
  try {
    const { kontonummer, belop } = req.body;
    const account = await Bankkonto.findOne({ where: { kontonummer } });
    if (!account) return res.status(404).json({ error: "Account not found" });
    if (parseFloat(account.saldo) < parseFloat(belop)) {
      return res.status(400).json({ error: "Insufficient funds" });
    }
    account.saldo = parseFloat(account.saldo) - parseFloat(belop);
    await account.save();
    await Transaksjon.create({ kontonummer, type: 'withdraw', belop });
    res.json({ message: "Withdrawal successful", account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
