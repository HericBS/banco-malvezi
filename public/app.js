// app.js
// Quando servido junto com a API, não precisa de host completo:
const API_URL = '/api';

// Exemplo de estrutura de menus
const menus = {
  CLIENTE: [
    { id: 'saldo', label: 'Saldo e Projeção', icon: '💰' },
    { id: 'deposito', label: 'Depósito', icon: '➕' },
    { id: 'saque', label: 'Saque', icon: '➖' },
    { id: 'transferencia', label: 'Transferência', icon: '🔄' },
    { id: 'extrato', label: 'Extrato', icon: '📄' },
    { id: 'limite', label: 'Consultar Limite', icon: '📈' }
  ],
  FUNCIONARIO: [
    { id: 'abrirConta', label: 'Abertura de Conta', icon: '📝' },
    { id: 'encerrarConta', label: 'Encerramento de Conta', icon: '❌' },
    { id: 'consulta', label: 'Consulta de Dados', icon: '🔍' },
    { id: 'alteracao', label: 'Alteração de Dados', icon: '✏️' },
    { id: 'cadastroFuncionario', label: 'Cadastro de Funcionário', icon: '👤' },
    { id: 'relatorio', label: 'Geração de Relatórios', icon: '📊' }
  ]
};

let tipoUsuarioAtual = null;

// Após login bem-sucedido, monte o menu lateral e mostre o conteúdo principal
function mostrarMenu(tipoUsuario) {
  tipoUsuarioAtual = tipoUsuario;
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('sidebarMenu').style.display = 'block';
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('sidebarTitle').textContent = tipoUsuario === 'FUNCIONARIO' ? 'Funcionário' : 'Cliente';

  // Monta o menu lateral dinamicamente
  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = '';
  menus[tipoUsuario].forEach(item => {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `<a class="nav-link" href="#" id="menu-${item.id}">${item.icon} ${item.label}</a>`;
    nav.appendChild(li);
    document.getElementById(`menu-${item.id}`).onclick = (e) => {
      e.preventDefault();
      carregarConteudo(item.id);
      // Destaca o item ativo
      document.querySelectorAll('#sidebarNav .nav-link').forEach(link => link.classList.remove('active'));
      e.target.classList.add('active');
    };
  });
  // Carrega o primeiro item por padrão
  carregarConteudo(menus[tipoUsuario][0].id);
}

// Exemplo de carregamento dinâmico do conteúdo principal
function carregarConteudo(operacao) {
  const main = document.getElementById('mainContent');
  switch (operacao) {
    case 'saldo':
      main.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h4>Saldo e Projeção de Rendimentos</h4>
            <form id="formSaldo">
              <div class="form-group">
                <label for="contaIdSaldo">ID da Conta</label>
                <input type="number" class="form-control" id="contaIdSaldo" required>
              </div>
              <button type="submit" class="btn btn-primary">Consultar</button>
            </form>
            <div id="saldoMsg" class="mt-3"></div>
          </div>
        </div>
      `;
      document.getElementById('formSaldo').onsubmit = async (e) => {
        e.preventDefault();
        // Chame sua API para consultar saldo e projeção
        // Exemplo:
        // const res = await fetch(`/api/saldo/${contaId}`);
        // ...
      };
      break;
    case 'deposito':
      main.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h4>Depósito</h4>
            <form id="formDeposito">
              <div class="form-group">
                <label for="contaIdDeposito">ID da Conta</label>
                <input type="number" class="form-control" id="contaIdDeposito" required>
              </div>
              <div class="form-group">
                <label for="valorDeposito">Valor</label>
                <input type="number" step="0.01" class="form-control" id="valorDeposito" required>
              </div>
              <button type="submit" class="btn btn-success">Depositar</button>
            </form>
            <div id="depositoMsg" class="mt-3"></div>
          </div>
        </div>
      `;
      document.getElementById('formDeposito').onsubmit = async (e) => {
        e.preventDefault();
        // Chame sua API para depósito
      };
      break;
    // ...adicione os demais cases para saque, transferência, extrato, limite, etc...
    case 'abrirConta':
      main.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h4>Abertura de Conta</h4>
            <!-- Formulário de abertura de conta para CP, CC, CI -->
            <!-- Implemente os campos conforme requisitos -->
          </div>
        </div>
      `;
      break;
    // ...demais operações do funcionário...
    default:
      main.innerHTML = `<div class="alert alert-info">Selecione uma operação no menu.</div>`;
  }
}

// Após login, mostra a tela correta e mantém o usuário logado nas operações
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const tipo = document.getElementById('loginTipo').value;
  const cpf = document.getElementById('loginCpf').value;
  const senha = document.getElementById('loginSenha').value;
  const otp = document.getElementById('loginOtp').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, senha, otp, tipo })
    });
    const json = await res.json();
    if (res.ok) {
      document.getElementById('loginSection').style.display = 'none';
      if (tipo === 'CLIENTE') {
        document.getElementById('telaCliente').style.display = 'block';
        document.getElementById('telaFuncionario').style.display = 'none';
        // Salva o id_usuario do cliente para uso nas operações
        window.usuarioLogado = json.cliente;
      } else if (tipo === 'FUNCIONARIO') {
        document.getElementById('telaFuncionario').style.display = 'block';
        document.getElementById('telaCliente').style.display = 'none';
        window.usuarioLogado = json.cliente;
      }
      document.getElementById('loginMsg').textContent = '';
    } else {
      document.getElementById('loginMsg').textContent = json.mensagem || 'Erro no login';
      document.getElementById('loginMsg').className = 'mt-2 text-danger';
    }
  } catch (err) {
    document.getElementById('loginMsg').textContent = 'Erro de conexão.';
    document.getElementById('loginMsg').className = 'mt-2 text-danger';
  }
});

// Gerar OTP
document.getElementById('btnGerarOtp').addEventListener('click', async () => {
  const cpf = document.getElementById('loginCpf').value;
  if (!cpf) {
    alert('Informe o CPF para gerar OTP.');
    return;
  }
  try {
  
    const res = await fetch(`${API_URL}/gerar-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf })
    });
    const json = await res.json();
    if (res.ok) {
      alert('OTP enviado! (Simulação: ' + json.otp + ')');
    } else {
      alert(json.mensagem || 'Erro ao gerar OTP');
    }
  } catch (err) {
    alert('Erro de conexão ao gerar OTP.');
  }
});

// Gerar OTP no front-end (usando o formulário de gerar OTP do HTML)
const gerarOtpForm = document.querySelector('form[action="/api/gerar-otp"]');
if (gerarOtpForm) {
  gerarOtpForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const cpf = document.getElementById('otpCpfInput').value;
    if (!cpf) {
      alert('Informe o CPF para gerar OTP.');
      return;
    }
    try {
      const res = await fetch('/api/gerar-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf })
      });
      const json = await res.json();
      if (res.ok) {
        // Remove popup anterior se existir
        const oldPopup = document.getElementById('otpPopup');
        if (oldPopup) oldPopup.remove();
        // Exibe o OTP em um pop-up estilizado usando classes CSS
        const popup = document.createElement('div');
        popup.id = 'otpPopup';
        popup.className = 'otp-popup';
        popup.innerHTML = `<h4>OTP Gerado</h4>
          <p class="otp-codigo">${json.otp}</p>
          <button class="btn btn-primary btn-sm" id="closeOtpPopup">Fechar</button>`;
        document.body.appendChild(popup);
        document.getElementById('closeOtpPopup').onclick = () => popup.remove();
      } else {
        alert(json.mensagem || 'Erro ao gerar OTP');
      }
    } catch (err) {
      alert('Erro de conexão ao gerar OTP.');
    }
  });
}

// Logout
function logout() {
  document.getElementById('telaCliente').style.display = 'none';
  document.getElementById('telaFuncionario').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
  window.usuarioLogado = null;
}

// Exemplo de POST para cadastrar cliente
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dados = {
    nome: document.getElementById('registerNome').value,
    cpf: document.getElementById('registerCpf').value,
    data_nascimento: document.getElementById('registerDataNascimento').value,
    telefone: document.getElementById('registerTelefone').value,
    senha: document.getElementById('registerSenha').value
  };

  try {
    // 1. Cadastrar cliente
    const resCliente = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    let mensagem = '';
    let clienteId = null;

    if (resCliente.headers.get('content-type')?.includes('application/json')) {
      const json = await resCliente.json();
      mensagem = json.mensagem || 'Cliente cadastrado!';
      clienteId = json.cliente?.id_usuario;
    } else if (resCliente.ok) {
      mensagem = 'Cliente cadastrado!';
    } else {
      mensagem = 'Erro ao cadastrar cliente.';
    }

    // 2. Se cadastrou cliente, criar conta
    if (clienteId) {
      const resConta = await fetch(`${API_URL}/contas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, tipo: 'CORRENTE' })
      });
      if (resConta.ok) {
        const contaJson = await resConta.json();
        mensagem += ' Conta criada com sucesso! Número: ' + contaJson.conta?.numero_conta;
      } else {
        mensagem += ' Erro ao criar conta.';
      }
    }

    document.getElementById('registerMsg').textContent = mensagem;
    document.getElementById('registerMsg').className = 'mt-2 text-success';
  } catch (err) {
    console.error('Erro no cadastro:', err);
    document.getElementById('registerMsg').textContent = 'Falha ao cadastrar cliente. Veja console para detalhes.';
    document.getElementById('registerMsg').className = 'mt-2 text-danger';
  }
});

// Função utilitária para pop-up
function showPopup(mensagem, tipo = 'info') {
  const oldPopup = document.getElementById('popupAviso');
  if (oldPopup) oldPopup.remove();
  const popup = document.createElement('div');
  popup.id = 'popupAviso';
  popup.className = 'otp-popup';
  popup.style.background = tipo === 'success' ? '#d4edda' : tipo === 'danger' ? '#f8d7da' : '#fff';
  popup.style.borderColor = tipo === 'success' ? '#28a745' : tipo === 'danger' ? '#dc3545' : '#007bff';
  popup.innerHTML = `
    <div style="font-weight:bold;margin-bottom:8px;">Aviso</div>
    <div>${mensagem}</div>
    <button class="btn btn-primary btn-sm mt-2" id="closePopupAviso">Fechar</button>
  `;
  document.body.appendChild(popup);
  document.getElementById('closePopupAviso').onclick = () => popup.remove();
}

// Exemplo de uso nos handlers:

// Consultar Saldo (Cliente)
document.getElementById('formSaldoCliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const contaId = document.getElementById('saldoContaIdCliente').value;
  try {
    const res = await fetch(`/api/saldo/${contaId}`);
    const json = await res.json();
    if (res.ok) {
      showPopup('Saldo: R$ ' + json.saldo, 'success');
    } else {
      showPopup(json.mensagem || 'Erro ao consultar saldo', 'danger');
    }
  } catch {
    showPopup('Erro de conexão.', 'danger');
  }
});

// Depósito (Cliente)
document.getElementById('formDepositoCliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const contaId = document.getElementById('depositContaIdCliente').value;
  const valor = Number(document.getElementById('depositValorCliente').value);
  try {
    const res = await fetch('/api/deposito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contaId, valor })
    });
    const json = await res.json();
    if (res.ok) {
      showPopup(json.mensagem + ' Novo saldo: R$ ' + json.saldo, 'success');
    } else {
      showPopup(json.mensagem || 'Erro ao depositar', 'danger');
    }
  } catch {
    showPopup('Erro de conexão.', 'danger');
  }
});

// Saque (Cliente)
document.getElementById('formSaqueCliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const contaId = document.getElementById('saqueContaIdCliente').value;
  const valor = Number(document.getElementById('saqueValorCliente').value);
  try {
    const res = await fetch('/api/saque', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contaId, valor })
    });
    const json = await res.json();
    if (res.ok) {
      showPopup(json.mensagem + ' Novo saldo: R$ ' + json.saldo, 'success');
    } else {
      showPopup(json.mensagem || 'Erro ao sacar', 'danger');
    }
  } catch {
    showPopup('Erro de conexão.', 'danger');
  }
});

// Transferência (Cliente)
document.getElementById('formTransferenciaCliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const origemId = document.getElementById('origemIdCliente').value;
  const destinoId = document.getElementById('destinoIdCliente').value;
  const valor = Number(document.getElementById('valorTransferenciaCliente').value);
  try {
    const res = await fetch('/api/transferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origemId, destinoId, valor })
    });
    const json = await res.json();
    if (res.ok) {
      showPopup(json.mensagem, 'success');
    } else {
      showPopup(json.mensagem || 'Erro na transferência', 'danger');
    }
  } catch {
    showPopup('Erro de conexão.', 'danger');
  }
});

// Extrato (Cliente)
document.getElementById('formExtratoCliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const contaId = document.getElementById('extratoContaIdCliente').value;
  try {
    const res = await fetch(`/api/extrato/${contaId}`);
    const json = await res.json();
    if (res.ok) {
      showPopup('<b>Extrato:</b><br>' + (json.extrato.map(t =>
        `${t.data_hora}: ${t.tipo_transacao} R$${t.valor} (${t.descricao})`
      ).join('<br>') || 'Nenhuma transação.'), 'success');
    } else {
      showPopup(json.mensagem || 'Erro ao consultar extrato', 'danger');
    }
  } catch {
    showPopup('Erro de conexão.', 'danger');
  }
});

// Consultar Limite (Cliente)
document.getElementById('formLimiteCliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const contaId = document.getElementById('limiteContaIdCliente').value;
  try {
    const res = await fetch(`/api/limite/${contaId}`);
    const json = await res.json();
    if (res.ok) {
      showPopup(`Limite atual: R$ ${json.limiteAtual} | Projeção: R$ ${json.limiteProjecao}`, 'success');
    } else {
      showPopup(json.mensagem || 'Erro ao consultar limite', 'danger');
    }
  } catch {
    showPopup('Erro de conexão.', 'danger');
  }
});

// ...adicione handlers para cada operação (abertura de conta, depósito, saque, etc) conforme os requisitos...