const pool = require('../config/database');

const gerarRelatorioMovimentacoes = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM vw_movimentacoes_recentes"
    );
    res.status(200).json({ relatorio: rows });
  } catch (error) {
    res.status(500).json({ mensagem: "Erro ao gerar relatório" });
  }
};

module.exports = { gerarRelatorioMovimentacoes };