const pool = require('../config/database');

class TransaçãoDAO {
  static async registrarTransação(contaOrigemId, contaDestinoId, valor, tipo, descricao) {
    await pool.execute(
      "INSERT INTO transacao (id_conta_origem, id_conta_destino, valor, tipo_transacao, descricao, data_hora) VALUES (?, ?, ?, ?, ?, NOW())",
      [contaOrigemId, contaDestinoId, valor, tipo, descricao]
    );
  }

  static async buscarPorConta(contaId) {
    const [rows] = await pool.execute(
      "SELECT * FROM transacao WHERE id_conta_origem = ? OR id_conta_destino = ? ORDER BY data_hora DESC",
      [contaId, contaId]
    );
    return rows;
  }
}

module.exports = TransaçãoDAO;