const express = require('express');
const router = express.Router();

// Rotas básicas - em desenvolvimento
router.get('/', (req, res) => {
  res.json({ message: `Rota ${route} - em desenvolvimento` });
});

module.exports = router;
