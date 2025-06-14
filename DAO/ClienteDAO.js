const pool = require('../config/database');

class ClienteDAO {
  static async buscarPorId(id) {
    const [rows] = await pool.execute("SELECT * FROM usuario WHERE id_usuario = ?", [id]);
    return rows[0];
  }

  static async cadastrar(nome, cpf, senha) {
    await pool.execute(
      "INSERT INTO usuario (nome, cpf, senha_hash, tipo_usuario) VALUES (?, ?, MD5(?), 'CLIENTE')",
      [nome, cpf, senha]
    );
  }
}

module.exports = ClienteDAO;