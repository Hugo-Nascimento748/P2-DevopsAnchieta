
const express = require("express");
const router = express.Router();
const autenticar = require("../middlewares/authMiddleware");

const {
  cadastrar,
  login
} = require("../controllers/authController");

router.post("/cadastro", cadastrar);
router.post("/login", login);

router.get("/perfil", autenticar, (req, res) => {
  res.status(200).json({
    mensagem: "Acesso autorizado!",
    usuario: req.usuario
  });
});

module.exports = router;
