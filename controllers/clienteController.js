const pool = require('../config/database');
const { registrarAuditoria } = require('../utils/auditoriaUtils');

// Cadastrar cliente
const cadastrarCliente = async (req, res) => {
  try {
    const { nome, cpf, senha } = req.body;
    await pool.execute("INSERT INTO usuario (nome, cpf, senha_hash, tipo_usuario) VALUES (?, ?, MD5(?), 'CLIENTE')", [nome, cpf, senha]);
    registrarAuditoria(req.user.id_usuario, 'CADASTRAR_CLIENTE', { nome, cpf });
    res.status(201).json({ mensagem: "Cliente cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao cadastrar cliente" });
  }
};

// Consultar perfil do cliente
const consultarPerfil = async (req, res) => {
  try {
    const { id_usuario } = req.user;
    const [rows] = await pool.execute("SELECT nome, cpf FROM usuario WHERE id_usuario = ?", [id_usuario]);
    if (rows.length === 0) return res.status(404).json({ mensagem: "Cliente não encontrado!" });
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao consultar perfil" });
  }
};

module.exports = { cadastrarCliente, consultarPerfil };