const pool = require('../config/database'); // Certifique-se de que esta linha aparece apenas uma vez
const { registrarAuditoria } = require('../utils/auditoria');

// Criar conta
const criarConta = async (req, res) => {
  try {
    const { tipoConta, clienteId } = req.body;
    await pool.execute("INSERT INTO conta (tipo_conta, id_cliente) VALUES (?, ?)", [tipoConta, clienteId]);
    res.status(201).json({ mensagem: "Conta criada com sucesso!" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao criar conta" });
  }
};

// Consultar saldo
const consultarSaldo = async (req, res) => {
  try {
    const { contaId } = req.params;
    const [rows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    if (rows.length === 0) return res.status(404).json({ mensagem: "Conta não encontrada!" });
    registrarAuditoria(req.user.id_usuario, 'CONSULTAR_SALDO', { contaId });
    res.status(200).json({ saldo: rows[0].saldo });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar depósito
const realizarDeposito = async (req, res) => {
  try {
    const { contaId, valor } = req.body;
    await pool.execute("INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, descricao) VALUES (?, 'DEPOSITO', ?, ?)", [contaId, valor, "Depósito realizado"]);
    const [rows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    registrarAuditoria(req.user.id_usuario, 'REALIZAR_DEPOSITO', { contaId, valor });
    res.status(200).json({ mensagem: "Depósito realizado!", saldo: rows[0].saldo });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar saque
const realizarSaque = async (req, res) => {
  try {
    const { contaId, valor } = req.body;
    await pool.execute("INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, descricao) VALUES (?, 'SAQUE', ?, ?)", [contaId, valor, "Saque realizado"]);
    const [rows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    registrarAuditoria(req.user.id_usuario, 'REALIZAR_SAQUE', { contaId, valor });
    res.status(200).json({ mensagem: "Saque realizado!", saldo: rows[0].saldo });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar transferência
const realizarTransferencia = async (req, res) => {
  try {
    const { origemId, destinoId, valor } = req.body;
    await pool.execute("INSERT INTO transacao (id_conta_origem, id_conta_destino, tipo_transacao, valor, descricao) VALUES (?, ?, 'TRANSFERENCIA', ?, ?)", [origemId, destinoId, valor, "Transferência realizada"]);
    registrarAuditoria(req.user.id_usuario, 'REALIZAR_TRANSFERENCIA', { origemId, destinoId, valor });
    res.status(200).json({ mensagem: "Transferência realizada!" });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Emitir extrato
const emitirExtrato = async (req, res) => {
  try {
    const { contaId } = req.params;
    const [rows] = await pool.execute("SELECT * FROM transacao WHERE id_conta_origem = ? OR id_conta_destino = ? ORDER BY data_hora DESC LIMIT 50", [contaId, contaId]);
    registrarAuditoria(req.user.id_usuario, 'EMITIR_EXTRATO', { contaId });
    res.status(200).json({ extrato: rows });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Consultar limite
const consultarLimite = async (req, res) => {
  try {
    const { contaId } = req.params;
    const [rows] = await pool.execute("SELECT limite FROM conta_corrente WHERE id_conta = ?", [contaId]);
    if (rows.length === 0) return res.status(404).json({ mensagem: "Conta não encontrada!" });
    registrarAuditoria(req.user.id_usuario, 'CONSULTAR_LIMITE', { contaId });
    res.status(200).json({ limiteAtual: rows[0].limite, limiteProjecao: (rows[0].limite * 1.05).toFixed(2) });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

module.exports = {
  criarConta,
  consultarSaldo,
  realizarDeposito,
  realizarSaque,
  realizarTransferencia,
  emitirExtrato,
  consultarLimite,
};