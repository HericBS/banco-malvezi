class Transação {
  constructor(id, contaOrigemId, contaDestinoId, valor, tipo, descricao, dataHora) {
    this.id = id;
    this.contaOrigemId = contaOrigemId;
    this.contaDestinoId = contaDestinoId;
    this.valor = valor;
    this.tipo = tipo;
    this.descricao = descricao;
    this.dataHora = dataHora;
  }
}

module.exports = Transação;