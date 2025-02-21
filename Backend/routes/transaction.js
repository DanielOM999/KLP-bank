const express = require("express");
const router = express.Router();
const { Bankkonto, Transaksjon } = require("../models");
const { Op } = require('sequelize');

const applyInterest = async () => {
  const interestRate = 0.04;
  const monthlyRate = interestRate / 12;
  
  const sparekontoAccounts = await Bankkonto.findAll({
    where: { kontotype: 'sparekonto' }
  });
  
  for (const account of sparekontoAccounts) {
    const interest = parseFloat(account.saldo) * monthlyRate;
    account.saldo = parseFloat(account.saldo) + interest;
    await account.save();
    await Transaksjon.create({
      bankkontoId: account.id,
      kontonummer: account.kontonummer,
      type: "deposit",
      belop: interest,
      nySaldo: account.saldo,
    });
  }
};

setInterval(applyInterest, 900000);

router.post("/deposit", async (req, res) => {
  try {
    const { kontonummer, belop } = req.body;
    const account = await Bankkonto.findOne({ where: { kontonummer } });
    if (!account) return res.status(404).json({ error: "Account not found" });

    if (account.kontotype === 'bsu') {
      const annualLimit = 27500;
      const totalLimit = 300000;
      
      const depositsThisYear = await Transaksjon.sum('belop', {
        where: {
          bankkontoId: account.id,
          type: 'deposit',
        }
      }) || 0;

      if (Number(depositsThisYear) + Number(belop) > annualLimit) {
        return res.status(400).json({ error: `Annual deposit limit of ${annualLimit} exceeded for BSU.` });
      }
      if (Number(account.saldo) + Number(belop) > totalLimit) {
        return res.status(400).json({ error: `Total balance for BSU cannot exceed ${totalLimit}.` });
      }
    }

    account.saldo = parseFloat(account.saldo) + parseFloat(belop);
    newBalance = parseFloat(account.saldo);
    await account.save();
    await Transaksjon.create({
      bankkontoId: account.id,
      kontonummer,
      type: "deposit",
      belop,
      nySaldo: newBalance,
    });
    res.json({ message: "Deposit successful", account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/withdraw", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { kontonummer, belop } = req.body;
    const account = await Bankkonto.findOne({ where: { kontonummer } });
    if (!account) return res.status(404).json({ error: "Account not found" });
    if (parseFloat(account.saldo) < parseFloat(belop)) {
      return res.status(400).json({ error: "Insufficient funds" });
    }
    account.saldo = parseFloat(account.saldo) - parseFloat(belop);
    newBalance = parseFloat(account.saldo);
    await account.save();
    await Transaksjon.create({
      bankkontoId: account.id,
      kontonummer,
      type: "withdraw",
      belop,
      nySaldo: newBalance,
    });
    res.json({ message: "Withdrawal successful", account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history/:kontonummer", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const account = await Bankkonto.findOne({
      where: {
        kontonummer: req.params.kontonummer,
        brukerId: req.user.id,
      },
      include: [
        {
          model: Transaksjon,
          order: [["dato", "DESC"]],
          limit: 30,
        },
      ],
    });

    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json(account.Transaksjons);
  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/balance-history/:kontonummer", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const transactions = await Transaksjon.findAll({
      include: [
        {
          model: Bankkonto,
          where: {
            kontonummer: req.params.kontonummer,
            brukerId: req.user.id,
          },
        },
      ],
      order: [["dato", "ASC"]],
      attributes: ["dato", "nySaldo"],
    });

    const balanceHistory = transactions.map((t) => ({
      date: t.dato.toISOString().split("T")[0],
      balance: t.nySaldo,
    }));

    res.json(balanceHistory);
  } catch (error) {
    console.error("Balance history error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
