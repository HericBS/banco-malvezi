const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');
const contaController = require('../controllers/contaController');
const usuarioController = require('../controllers/usuarioController');
const funcionarioController = require('../controllers/funcionarioController');
const relatorioController = require('../controllers/relatorioController');

// Rotas Cliente
router.post('/clientes', clienteController.cadastrarCliente);
router.get('/clientes/perfil', clienteController.consultarPerfil);

// Rotas Relatórios
router.get('/relatorios/movimentacoes', relatorioController.gerarRelatorioMovimentacoes);

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

module.exports = router;