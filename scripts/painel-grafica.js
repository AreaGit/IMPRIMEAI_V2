// =======================
// Variáveis globais
// =======================
let pedidos = [];
let conta = {};
const agora = new Date();
const mesAtual = agora.getMonth(); // 0-11
const anoAtual = agora.getFullYear();

// =======================
// Elementos da UI
// =======================
const nomeGrafica     = document.getElementById('nome-grafica');
const pedidosBody     = document.getElementById('pedidos-body');
const iconeHome       = document.getElementById('inicio');
const boasVindas      = document.getElementById('welcome');
const secaoPedidos    = document.getElementById('pedidos');
const secaoSaldo      = document.getElementById('saldo');
const secaoConta      = document.getElementById('minha-conta');
const loadingScreen   = document.getElementById('loading');

// =======================
// Utilitários
// =======================
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusIcon(status) {
  switch (status) {
    case 'Recebido': return '📥';
    case 'Em produção': return '⚙️';
    case 'Finalizado/Enviado para Transporte': return '📦';
    case 'Entregue': return '✅';
    default: return '❓';
  }
}

// =======================
// Carregar dados do usuário
// =======================
async function carregarInfoUsers() {
  try {
    const response = await fetch('/perfilGrafica/dados');
    if (!response.ok) throw new Error('Erro ao buscar os dados do usuário');

    const data = await response.json();
    nomeGrafica.textContent = data.userCad;

    conta = {
      nome: data.userCad,
      email: data.user.emailCad,
      telefone: data.user.telefoneCad,
      banco: data.user.bancoCad,
      agencia: data.user.agenciaCad,
      conta: data.user.contaCorrenteCad
    };

    const dadosConta = document.getElementById('dados-conta');
    dadosConta.innerHTML = '';
    for (const chave in conta) {
      const p = document.createElement('p');
      p.innerHTML = `<strong>${capitalize(chave)}:</strong> ${conta[chave]}`;
      dadosConta.appendChild(p);
    }
  } catch (error) {
    console.error(error);
  }
}

// =======================
// Renderizar pedidos
// =======================
function renderPedidos(pedidosFiltrados) {
  const container = document.getElementById('cards-pedidos');
  if (!container) return;

  container.innerHTML = '';

  pedidosFiltrados.forEach((pedido, i) => {
    const card = document.createElement('div');
    card.className = 'card-pedido';

    const icon = getStatusIcon(pedido.statusPed);
    const dataCriacao = new Date(pedido.createdAt).toLocaleString('pt-BR');
    const produtos = Array.isArray(pedido.produtos) ? pedido.produtos : [];

    const produtosHtml = produtos.length > 0
      ? produtos.map(p => `<li>${p.nomeProd} - <strong>${p.quantidade}</strong></li>`).join('')
      : `<li>Nenhum produto encontrado</li>`;

    card.innerHTML = `
      <h4><span class="status-icon">${icon}</span> Pedido #${pedido.idPed}</h4>
      <p><strong>Produtos:</strong></p>
      <ul class="lista-produtos">${produtosHtml}</ul>
      <p class="status"><strong>Status:</strong> ${pedido.statusPed}</p>
      <p><strong>Data:</strong> ${dataCriacao}</p>
    `;

    card.addEventListener('click', () => {
      window.location.href = `/detalhes-pedidos?idPedido=${pedido.idPed}`;
    });

    container.appendChild(card);

    setTimeout(() => card.classList.add('aparecendo'), i * 80);
  });

  document.getElementById('pedidos-recebidos').textContent = pedidosFiltrados.length;
}

// =======================
// Filtros
// =======================
function aplicarFiltros() {
  const filtroStatus     = document.getElementById('filtro-status');
  const filtroDataInicio = document.getElementById('filtro-data-inicio');
  const filtroDataFim    = document.getElementById('filtro-data-fim');

  const statusSelecionado = filtroStatus ? filtroStatus.value : "Todos";
  const inicio = filtroDataInicio ? filtroDataInicio.value : "";
  const fim    = filtroDataFim ? filtroDataFim.value : "";

  const filtrados = pedidos.filter(pedido => {
    const dataPedido = new Date(pedido.createdAt);
    const dataISO = dataPedido.toISOString().split('T')[0];
    const dataOk = (!inicio || dataISO >= inicio) && (!fim || dataISO <= fim);
    const statusOk = statusSelecionado === "Todos" || pedido.statusPed === statusSelecionado;
    return dataOk && statusOk;
  });

  renderPedidos(filtrados);
}

function limparFiltros() {
  ['filtro-status', 'filtro-data-inicio', 'filtro-data-fim'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === 'filtro-status' ? "Todos" : "";
  });
  renderPedidos(pedidos);
}

function inicializarFiltros() {
  const filtroStatus     = document.getElementById('filtro-status');
  const filtroDataInicio = document.getElementById('filtro-data-inicio');
  const filtroDataFim    = document.getElementById('filtro-data-fim');
  const btnLimpar        = document.getElementById('limpar-filtros');

  if (filtroStatus) filtroStatus.addEventListener('change', aplicarFiltros);
  if (filtroDataInicio) filtroDataInicio.addEventListener('change', aplicarFiltros);
  if (filtroDataFim) filtroDataFim.addEventListener('change', aplicarFiltros);
  if (btnLimpar) btnLimpar.addEventListener('click', limparFiltros);
}

// =======================
// Buscar pedidos no backend
// =======================
async function carregarPedidos() {
  try {
    const res = await fetch('/pedidos-cadastrados');
    const data = await res.json();
    pedidos = data.pedidos || [];

    console.log("✅ Pedidos recebidos do backend:", pedidos);

    aplicarFiltros();
  } catch (err) {
    console.error("❌ Erro ao carregar pedidos:", err);
  } finally {
    if (loadingScreen) loadingScreen.style.display = 'none';
  }
}

// =======================
// Saldo e Saques
// =======================
const graficaId   = 1;   // Ajustar conforme necessário
const recipientId = 123; // Ajustar conforme necessário

async function carregarSaldos() {
  const dadosSaldo = document.getElementById('dados-saldo');
  try {
    const [disponivelRes, totalRes] = await Promise.all([
      fetch(`/api/saldo-grafica?graficaId=${graficaId}`),
      fetch(`/api/full-balance-grafica?graficaId=${graficaId}`)
    ]);

    const disponivel = await disponivelRes.json();
    const total = await totalRes.json();

    document.getElementById('saldo-atual').textContent = disponivel.graficaBalance;

    dadosSaldo.innerHTML = `
      <p><strong>Disponível para Saque:</strong> R$ ${disponivel.graficaBalance}</p>
      <p><strong>Total Bruto:</strong> R$ ${total.total}</p>
      <p><strong>Quer adiantar o valor ?:</strong> R$ ${total.desconto}</p>
      <p><strong>Total com Desconto:</strong> R$ ${total.valorComDesconto}</p>
    `;
  } catch (error) {
    dadosSaldo.innerHTML = `<p style="color:red;">Erro ao carregar saldos</p>`;
  }
}

async function sacar(endpoint) {
  const res = await fetch(`/api/full-balance-grafica?graficaId=${graficaId}`);
  const data = await res.json();
  const valor = parseFloat(data.valorComDesconto);

  try {
    const saque = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: valor, recipient_id: recipientId })
    });

    const result = await saque.json();
    document.getElementById('mensagem-saque').textContent = result.message || 'Erro no saque';
    carregarSaldos();
  } catch (err) {
    console.error(err);
  }
}

// =======================
// Navegação
// =======================
function inicializarNavegacao() {
  const links = document.querySelectorAll('.sidebar nav a');
  const sections = document.querySelectorAll('.section');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.section;
      sections.forEach(sec => sec.classList.remove('active'));
      sections.forEach(sec => sec.style.display = 'none');
      const destino = document.getElementById(target);
      destino.classList.add('active');
      destino.style.display = 'block';
    });
  });

  iconeHome.addEventListener('click', () => {
    boasVindas.style.display = 'block';
    secaoPedidos.style.display = 'none';
    secaoSaldo.style.display = 'none';
    secaoConta.style.display = 'none';
  });
}

// =======================
// Inicialização
// =======================
document.addEventListener('DOMContentLoaded', () => {
  inicializarFiltros();
  inicializarNavegacao();
  carregarInfoUsers();
  carregarPedidos();
  carregarSaldos();

  document.getElementById('sacar-disponivel')
    .addEventListener('click', () => {
      if (confirm('Deseja sacar o valor disponível para saque agora?')) {
        sacar('/api/withdraw-grafica');
      }
    });

  document.getElementById('sacar-total')
    .addEventListener('click', () => {
      if (confirm('Deseja sacar o saldo total (sem considerar elegibilidade)?')) {
        sacar('/api/full-withdraw-grafica');
      }
    });
});