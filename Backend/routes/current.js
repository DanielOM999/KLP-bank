const express = require("express");
const router = express.Router();
const { Bruker, Bankkonto } = require("../models");

router.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const userWithBankAccounts = await Bruker.findByPk(req.user.id, {
        include: [
          {
            model: Bankkonto,
            attributes: ['id', 'kontonummer', 'saldo', 'kontotype'],
            separate: true,
            order: [['createdAt', 'ASC']]
          }
        ]
      });
      
      res.json({ user: userWithBankAccounts });
    } catch (error) {
      console.error("Error fetching user with bank accounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.json({ error: "Not authenticated" });
  }
});

module.exports = router;