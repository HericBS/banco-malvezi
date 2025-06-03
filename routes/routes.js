const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');
const contaController = require('../controllers/contaController');
const usuarioController = require('../controllers/usuarioController');
const funcionarioController = require('../controllers/funcionarioController');

// Rotas Cliente
router.post('/clientes', clienteController.cadastrarCliente);
// Remova ou comente a linha abaixo se não existir a função listarClientes
// router.get('/clientes', clienteController.listarClientes);

// Rotas Conta
router.post('/contas', contaController.criarConta);
router.post('/deposito', contaController.realizarDeposito);
router.post('/saque', contaController.realizarSaque);
router.post('/transferencia', contaController.realizarTransferencia);
router.get('/saldo/:contaId', contaController.consultarSaldo);
router.get('/extrato/:contaId', contaController.emitirExtrato);
router.get('/limite/:contaId', contaController.consultarLimite);

// Rotas Usuário
router.post('/usuario', usuarioController.cadastrarUsuario);
router.post('/login', usuarioController.login);
router.post('/gerar-otp', usuarioController.gerarOTP);
router.post('/logout', usuarioController.encerrarSessao);

// Rotas Funcionário
router.post('/funcionarios', funcionarioController.cadastrarFuncionario);

module.exports = router;
