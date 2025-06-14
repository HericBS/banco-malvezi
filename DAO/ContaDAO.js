const pool = require('../config/database');

class ContaDAO {
  static async buscarPorId(id) {
    const [rows] = await pool.execute("SELECT * FROM conta WHERE id_conta = ?", [id]);
    return rows[0];
  }

  static async criar(tipoConta, clienteId) {
    await pool.execute("INSERT INTO conta (tipo_conta, id_cliente) VALUES (?, ?)", [tipoConta, clienteId]);
  }

  static async atualizarSaldo(id, novoSaldo) {
    await pool.execute("UPDATE conta SET saldo = ? WHERE id_conta = ?", [novoSaldo, id]);
  }
}

module.exports = ContaDAO;