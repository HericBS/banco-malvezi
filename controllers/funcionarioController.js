const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Cadastrar Funcionário
const cadastrarFuncionario = async (req, res) => {
  try {
    const { nome, cpf, telefone, senha, cargo, id_supervisor } = req.body;
    if (!nome || !cpf || !telefone || !senha || !cargo) {
      return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchidos!" });
    }

    const [rows] = await pool.execute("SELECT * FROM usuario WHERE cpf = ?", [cpf]);
    if (rows.length > 0) {
      return res.status(409).json({ mensagem: "Este CPF já está cadastrado!" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await pool.execute(
      "INSERT INTO usuario (nome, cpf, telefone, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?, 'FUNCIONARIO')",
      [nome, cpf, telefone, senhaHash]
    );
    const id_usuario = result.insertId;
    const codigoFuncionario = `FUNC${id_usuario}`;

    await pool.execute(
      "INSERT INTO funcionario (id_usuario, codigo_funcionario, cargo, id_supervisor) VALUES (?, ?, ?, ?)",
      [id_usuario, codigoFuncionario, cargo, id_supervisor || null]
    );

    // Auditoria pode ser chamada aqui se desejar
    return res.status(201).json({ mensagem: "Funcionário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro em cadastrar funcionário:", error);
    return res.status(500).json({ mensagem: "Erro interno no servidor" });
  }
};

module.exports = {
  cadastrarFuncionario
};
