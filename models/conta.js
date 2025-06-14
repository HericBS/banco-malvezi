class Conta {
  constructor(id, tipo, saldo, clienteId) {
    this.id = id;
    this.tipo = tipo;
    this.saldo = saldo;
    this.clienteId = clienteId;
  }
}

module.exports = Conta;