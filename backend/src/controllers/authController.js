
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function cadastrar(req, res) {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios."
      });
    }

    if (typeof nome !== "string" ||
        typeof email !== "string" ||
        typeof senha !== "string" ||
        typeof tipo !== "undefined" && typeof tipo !== "string") {
      return res.status(400).json({
        erro: "Dados inválidos."
      });
    }

    if (senha.length < 8) {
      return res.status(400).json({
        erro: "A senha deve ter pelo menos 8 caracteres."
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const nomeNormalizado = nome.trim();

    if (!nomeNormalizado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      return res.status(400).json({
        erro: "Nome ou email inválido."
      });
    }

    const tipoUsuario = tipo || "CLIENTE";

    if (!["CLIENTE", "BARBEIRO"].includes(tipoUsuario)) {
      return res.status(400).json({
        erro: "Tipo de usuário inválido."
      });
    }

    const existente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado }
    });

    if (existente) {
      return res.status(409).json({
        erro: "Este email já está cadastrado."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await prisma.usuario.create({
      data: {
        nome: nomeNormalizado,
        email: emailNormalizado,
        senha: senhaHash,
        tipo: tipoUsuario
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        criadoEm: true
      }
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario
    });

  } catch (erro) {
    console.error(erro);

    if (erro.code === "P2002") {
      return res.status(409).json({
        erro: "Este email já está cadastrado."
      });
    }

    return res.status(500).json({
      erro: "Erro interno ao cadastrar usuário."
    });
  }
}


async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (typeof email !== "string" ||
        typeof senha !== "string" ||
        !email.trim() || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios."
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos."
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return res.status(401).json({
        erro: "Email ou senha inválidos."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro interno ao realizar login."
    });
  }
}

module.exports = { cadastrar, login };
