function gerarOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function validarOTP(otp, otp_ativo, otp_expiracao) {
  return otp === otp_ativo && new Date() < new Date(otp_expiracao);
}

module.exports = { gerarOTP, validarOTP };