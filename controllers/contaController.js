const pool = require('../config/database');

// Criar Conta
const criarConta = async (req, res) => {
  try {
    const { clienteId, tipo } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO conta (id_agencia, id_cliente, tipo_conta, saldo, numero_conta) VALUES (?, ?, ?, 0, ?)",
      [1, clienteId, tipo, 'TEMP']
    );
    const numeroConta = "CONTA" + result.insertId;
    await pool.execute("UPDATE conta SET numero_conta = ? WHERE id_conta = ?", [numeroConta, result.insertId]);
    const novaConta = { id_conta: result.insertId, clienteId, tipo_conta: tipo, saldo: 0, numero_conta: numeroConta };
    return res.status(201).json({ mensagem: "Conta criada com sucesso!", conta: novaConta });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar Depósito
const realizarDeposito = async (req, res) => {
  try {
    const { contaId, valor } = req.body;
    const [contaRows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    if (contaRows.length === 0)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    await pool.execute("UPDATE conta SET saldo = saldo + ? WHERE id_conta = ?", [valor, contaId]);
    await pool.execute(
      "INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, descricao) VALUES (?, 'DEPOSITO', ?, ?)",
      [contaId, valor, "Depósito realizado"]
    );
    const [newRows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    return res.status(200).json({ mensagem: "Depósito realizado!", saldo: newRows[0].saldo });
  } catch (error) {
    console.error("Erro em depósito:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar Saque
const realizarSaque = async (req, res) => {
  try {
    const { contaId, valor } = req.body;
    const [contaRows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    if (contaRows.length === 0)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    const saldoAtual = contaRows[0].saldo;
    if (saldoAtual < valor)
      return res.status(400).json({ mensagem: "Saldo insuficiente!" });

    await pool.execute("UPDATE conta SET saldo = saldo - ? WHERE id_conta = ?", [valor, contaId]);
    await pool.execute(
      "INSERT INTO transacao (id_conta_origem, tipo_transacao, valor, descricao) VALUES (?, 'SAQUE', ?, ?)",
      [contaId, valor, "Saque realizado"]
    );
    const [newRows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    return res.status(200).json({ mensagem: "Saque realizado!", saldo: newRows[0].saldo });
  } catch (error) {
    console.error("Erro em saque:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Realizar Transferência
const realizarTransferencia = async (req, res) => {
  try {
    const { origemId, destinoId, valor } = req.body;
    const [origRows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [origemId]);
    const [destRows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [destinoId]);
    if (origRows.length === 0 || destRows.length === 0) {
      return res.status(404).json({ mensagem: "Conta(s) não encontrada(s)!" });
    }
    if (origRows[0].saldo < valor)
      return res.status(400).json({ mensagem: "Saldo insuficiente!" });

    await pool.execute("UPDATE conta SET saldo = saldo - ? WHERE id_conta = ?", [valor, origemId]);
    await pool.execute("UPDATE conta SET saldo = saldo + ? WHERE id_conta = ?", [valor, destinoId]);
    await pool.execute(
      "INSERT INTO transacao (id_conta_origem, id_conta_destino, tipo_transacao, valor, descricao) VALUES (?, ?, 'TRANSFERENCIA', ?, ?)",
      [origemId, destinoId, valor, "Transferência realizada"]
    );
    return res.status(200).json({ mensagem: "Transferência realizada!" });
  } catch (error) {
    console.error("Erro em transferência:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Consultar Saldo
const consultarSaldo = async (req, res) => {
  try {
    const { contaId } = req.params;
    const [rows] = await pool.execute("SELECT saldo FROM conta WHERE id_conta = ?", [contaId]);
    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    return res.status(200).json({ saldo: rows[0].saldo });
  } catch (error) {
    console.error("Erro ao consultar saldo:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Emitir Extrato
const emitirExtrato = async (req, res) => {
  try {
    const { contaId } = req.params;
    const [rows] = await pool.execute(
      "SELECT * FROM transacao WHERE (id_conta_origem = ? OR id_conta_destino = ?) ORDER BY data_hora DESC",
      [contaId, contaId]
    );
    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Nenhuma transação encontrada!" });
    return res.status(200).json({ extrato: rows });
  } catch (error) {
    console.error("Erro ao emitir extrato:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

// Consultar Limite
const consultarLimite = async (req, res) => {
  try {
    const { contaId } = req.params;
    const [rows] = await pool.execute("SELECT limite FROM conta WHERE id_conta = ?", [contaId]);
    if (rows.length === 0)
      return res.status(404).json({ mensagem: "Conta não encontrada!" });

    const limiteAtual = rows[0].limite || 0;
    const projecao = Number((limiteAtual * 1.05).toFixed(2));
    return res.status(200).json({ limiteAtual, limiteProjecao: projecao });
  } catch (error) {
    console.error("Erro ao consultar limite:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

module.exports = {
  criarConta,
  realizarDeposito,
  realizarSaque,
  realizarTransferencia,
  consultarSaldo,
  emitirExtrato,
  consultarLimite
};
