const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Função utilitária para buscar conta
const getContaById = async (contaId) => {
  const [rows] = await pool.execute("SELECT * FROM conta WHERE id_conta = ?", [contaId]);
  return rows[0];
};

// Cadastrar Cliente
const cadastrarCliente = async (req, res) => {
  try {
    const { nome, cpf, telefone, senha, data_nascimento } = req.body;

    if (!nome || !cpf || !telefone || !senha || !data_nascimento) {
      return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    const [rows] = await pool.execute("SELECT * FROM usuario WHERE cpf = ?", [cpf]);
    if (rows.length > 0) {
      return res.status(409).json({ mensagem: "Este CPF já está cadastrado!" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [result] = await pool.execute(
      `INSERT INTO usuario (nome, cpf, data_nascimento, telefone, senha_hash, tipo_usuario)
       VALUES (?, ?, ?, ?, ?, 'CLIENTE')`,
      [nome, cpf, data_nascimento, telefone, senhaHash]
    );

    const novoCliente = { id_usuario: result.insertId, nome, cpf, data_nascimento, telefone };
    return res.status(201).json({ mensagem: "Cliente cadastrado com sucesso!", cliente: novoCliente });
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Consultar Saldo
const consultarSaldo = async (req, res) => {
  try {
    const { contaId } = req.params;
    const conta = await getContaById(contaId);

    if (!conta)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    return res.status(200).json({ saldo: conta.saldo });
  } catch (error) {
    console.error("Erro ao consultar saldo:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar Depósito
const realizarDeposito = async (req, res) => {
  try {
    const { contaId, valor } = req.body;

    if (typeof valor !== 'number' || valor <= 0)
      return res.status(400).json({ mensagem: "Valor inválido!" });

    const conta = await getContaById(contaId);
    if (!conta)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    await pool.execute("UPDATE conta SET saldo = saldo + ? WHERE id_conta = ?", [valor, contaId]);
    await pool.execute(
      `INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, descricao)
       VALUES (?, 'DEPOSITO', ?, ?)`,
      [contaId, valor, "Depósito realizado"]
    );

    const novaConta = await getContaById(contaId);
    return res.status(200).json({ mensagem: "Depósito realizado!", saldo: novaConta.saldo });
  } catch (error) {
    console.error("Erro em depósito:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar Saque
const realizarSaque = async (req, res) => {
  try {
    const { contaId, valor } = req.body;

    if (typeof valor !== 'number' || valor <= 0)
      return res.status(400).json({ mensagem: "Valor inválido!" });

    const conta = await getContaById(contaId);
    if (!conta)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    if (conta.saldo < valor)
      return res.status(400).json({ mensagem: "Saldo insuficiente!" });

    await pool.execute("UPDATE conta SET saldo = saldo - ? WHERE id_conta = ?", [valor, contaId]);
    await pool.execute(
      `INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, descricao)
       VALUES (?, 'SAQUE', ?, ?)`,
      [contaId, valor, "Saque realizado"]
    );

    const novaConta = await getContaById(contaId);
    return res.status(200).json({ mensagem: "Saque realizado!", saldo: novaConta.saldo });
  } catch (error) {
    console.error("Erro em saque:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar Transferência com transação
const realizarTransferencia = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { origemId, destinoId, valor } = req.body;

    if (typeof valor !== 'number' || valor <= 0)
      return res.status(400).json({ mensagem: "Valor inválido!" });

    await conn.beginTransaction();

    const [origRows] = await conn.execute("SELECT saldo FROM conta WHERE id_conta = ?", [origemId]);
    const [destRows] = await conn.execute("SELECT saldo FROM conta WHERE id_conta = ?", [destinoId]);

    if (origRows.length === 0 || destRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ mensagem: "Conta(s) não encontrada(s)!" });
    }

    if (origRows[0].saldo < valor) {
      await conn.rollback();
      return res.status(400).json({ mensagem: "Saldo insuficiente!" });
    }

    await conn.execute("UPDATE conta SET saldo = saldo - ? WHERE id_conta = ?", [valor, origemId]);
    await conn.execute("UPDATE conta SET saldo = saldo + ? WHERE id_conta = ?", [valor, destinoId]);

    await conn.execute(
      `INSERT INTO transacao (id_conta_origem, id_conta_destino, tipo_transacao, valor, descricao)
       VALUES (?, ?, 'TRANSFERENCIA', ?, ?)`,
      [origemId, destinoId, valor, "Transferência realizada"]
    );

    await conn.commit();

    const novaOrigem = await getContaById(origemId);
    const novoDestino = await getContaById(destinoId);

    return res.status(200).json({
      mensagem: "Transferência realizada!",
      saldo_origem: novaOrigem.saldo,
      saldo_destino: novoDestino.saldo
    });
  } catch (error) {
    await conn.rollback();
    console.error("Erro em transferência:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  } finally {
    conn.release();
  }
};

// Emitir Extrato
const emitirExtrato = async (req, res) => {
  try {
    const { contaId } = req.params;
    const [rows] = await pool.execute(
      `SELECT * FROM transacao
       WHERE id_conta_origem = ? OR id_conta_destino = ?
       ORDER BY data_hora DESC`,
      [contaId, contaId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao emitir extrato:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Consultar Limite
const consultarLimite = async (req, res) => {
  try {
    const { contaId } = req.params;
    const conta = await getContaById(contaId);

    if (!conta)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    return res.status(200).json({ limite: conta.limite });
  } catch (error) {
    console.error("Erro ao consultar limite:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

module.exports = {
  cadastrarCliente,
  consultarSaldo,
  realizarDeposito,
  realizarSaque,
  realizarTransferencia,
  emitirExtrato,
  consultarLimite
};
