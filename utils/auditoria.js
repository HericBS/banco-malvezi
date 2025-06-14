const pool = require('../config/database');

async function registrarAuditoria(id_usuario, acao, detalhes = {}) {
  try {
    await pool.execute(
      "INSERT INTO auditoria (id_usuario, acao, data_hora, detalhes) VALUES (?, ?, NOW(), ?)",
      [id_usuario, acao, JSON.stringify(detalhes)]
    );
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
}

module.exports = { registrarAuditoria };