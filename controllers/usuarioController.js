const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = "sua_chave_secreta";

// Cadastrar Usuário
const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, cpf, telefone, senha, data_nascimento } = req.body;
    const [rows] = await pool.execute("SELECT * FROM usuario WHERE cpf = ?", [cpf]);
    if (rows.length > 0)
      return res.status(409).json({ mensagem: "Usuário já cadastrado!" });

    const senhaHash = await bcrypt.hash(senha, 10);
    await pool.execute(
      "INSERT INTO usuario (nome, cpf, data_nascimento, telefone, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?, ?, 'CLIENTE')",
      [nome, cpf, data_nascimento, telefone, senhaHash]
    );
    return res.status(201).json({ mensagem: "Cliente cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro em cadastrarUsuario:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;
    const [rows] = await pool.execute("SELECT * FROM usuario WHERE cpf = ?", [cpf]);
    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Usuário não encontrado!" });

    const cliente = rows[0];
    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);
    if (!senhaValida)
      return res.status(400).json({ mensagem: "Senha incorreta!" });

    const token = jwt.sign({ id: cliente.id_usuario, cpf: cliente.cpf }, secret, { expiresIn: '1h' });
    return res.status(200).json({ mensagem: "Login bem-sucedido!", token, cliente });
  } catch (error) {
    console.error("Erro em login:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Gerar OTP
const gerarOTP = async (req, res) => {
  try {
    // Suporte tanto para JSON quanto para x-www-form-urlencoded
    const cpf = req.body.cpf || (req.body && req.body['cpf']);
    if (!cpf) {
      return res.status(400).json({ mensagem: "CPF é obrigatório!" });
    }
    const [rows] = await pool.execute("SELECT * FROM usuario WHERE cpf = ?", [cpf]);
    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Usuário não encontrado!" });

    const usuario = rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = new Date(Date.now() + 5 * 60000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await pool.execute(
      "UPDATE usuario SET otp_ativo = ?, otp_expiracao = ? WHERE id_usuario = ?",
      [otp, otpExpiration, usuario.id_usuario]
    );

    // Se for requisição de formulário, pode redirecionar ou renderizar uma página
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
      return res.status(200).send(`<div class="alert alert-success">OTP gerado com sucesso! Seu OTP: <b>${otp}</b></div>`);
    }

    return res.status(200).json({ mensagem: "OTP gerado com sucesso!", otp, otpExpiration });
  } catch (error) {
    console.error("Erro em gerar OTP:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Registrar Auditoria
const registrarAuditoria = async (id_usuario, acao, detalhes = {}) => {
  try {
    await pool.execute("INSERT INTO auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)", [
      id_usuario,
      acao,
      JSON.stringify(detalhes)
    ]);
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
};

// Encerrar Sessão (Logout)
const encerrarSessao = async (req, res) => {
  try {
    const { cpf } = req.body;
    const [rows] = await pool.execute("SELECT id_usuario FROM usuario WHERE cpf = ?", [cpf]);
    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Usuário não encontrado!" });

    const id_usuario = rows[0].id_usuario;
    await registrarAuditoria(id_usuario, "LOGOUT", { mensagem: "Sessão encerrada pelo cliente" });
    return res.status(200).json({ mensagem: "Sessão encerrada com sucesso!" });
  } catch (error) {
    console.error("Erro em encerrar sessão:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

module.exports = {
  cadastrarUsuario,
  login,
  gerarOTP,
  registrarAuditoria,
  encerrarSessao
};
