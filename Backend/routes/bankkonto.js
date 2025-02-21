const express = require("express");
const router = express.Router();
const { Bankkonto, Bruker } = require("../models");

router.post("/create", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const userID = req.user.id;
      const user = await Bruker.findByPk(userID);
      if (!user) return res.status(404).json({ error: "User not found" });

      const bankKontoNumber = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();
      const kontonummer = bankKontoNumber;

      const { kontotype } = req.body;

      const newAccount = await Bankkonto.create({
        kontonummer,
        saldo: 0.0,
        brukerId: userID,
        kontotype: kontotype || "standard",
      });

      res.json({
        id: newAccount.id,
        kontonummer: newAccount.kontonummer,
        saldo: newAccount.saldo,
        kontotype: newAccount.kontotype,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.json({ error: "Not authenticated" });
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
