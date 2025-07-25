const nomeGrafica = document.getElementById('nome-grafica');
document.getElementById('pedidos-recebidos').textContent = pedidos.length;
const pedidosBody = document.getElementById('pedidos-body');
const iconeHome = document.getElementById('inicio');
const boasVindas = document.getElementById('welcome');
const secaoPedidos = document.getElementById('pedidos');
const secaoSaldo = document.getElementById('saldo');
const secaoConta = document.getElementById('minha-conta');
let conta = {};
    
iconeHome.addEventListener('click', () => {
    boasVindas.style.display = 'block';
    secaoPedidos.style.display = 'none';
    secaoSaldo.style.display = 'none';
    secaoConta.style.display = 'none';
});    


async function carregarInfoUsers() {
    try {
        const response = await fetch('/perfilGrafica/dados');
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }

        const data = await response.json();
        nomeGrafica.textContent = `${data.userCad}`

        conta = {
          nome: data.userCad,
          email: data.user.emailCad,
          telefone: data.user.telefoneCad,
          banco: data.user.bancoCad,
          agencia: data.user.agenciaCad,
          conta: data.user.contaCorrenteCad
        };

        // Agora sim: exibe os dados na tela após carregar
        const dadosConta = document.getElementById('dados-conta');
        dadosConta.innerHTML = ''; // limpa antes de popular
        for (const chave in conta) {
          const p = document.createElement('p');
          p.innerHTML = `<strong>${capitalize(chave)}:</strong> ${conta[chave]}`;
          dadosConta.appendChild(p);
        }

    } catch (error) {
        console.log(error)
    }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

carregarInfoUsers();

document.addEventListener('DOMContentLoaded', async () => {
      const tbody = document.getElementById('pedidos-body');
      const filtroDataInicio = document.getElementById('filtro-data-inicio');
      const filtroDataFim = document.getElementById('filtro-data-fim');
      const filtroStatus = document.getElementById('filtro-status');
      const btnLimparFiltros = document.getElementById('limpar-filtros');
      const loading = document.getElementById('loading');
      const loadingFrase = document.getElementById('loading-frase');

      let pedidos = [];

      function getStatusIcon(status) {
        switch(status) {
          case "Aguardando": return "⏳";
          case "Pedido Aceito Pela Gráfica": return "✅";
          case "Finalizado": return "🎉";
          case "Pedido Enviado pela Gráfica": return "📦";
          case "Pedido Entregue pela Gráfica": return "📬";
          default: return "📄";
        }
      }

      async function renderPedidos(pedidosFiltrados) {
        tbody.innerHTML = '';
        for (const pedido of pedidosFiltrados) {
          const dataCriacao = new Date(pedido.createdAt).toLocaleString('pt-BR');
          const icon = getStatusIcon(pedido.statusPed);
          const tr = document.createElement('tr');
          tr.style.opacity = 0;
          tr.innerHTML = `
            <td>${pedido.idPed}</td>
            <td>${pedido.nomeProd}</td>
            <td>${pedido.quantidade}</td>
            <td><span class="status-icon">${icon}</span>${pedido.statusPed}</td>
            <td>${dataCriacao}</td>
          `;
          tbody.appendChild(tr);
          requestAnimationFrame(() => {
            tr.style.transition = 'opacity 0.4s ease';
            tr.style.opacity = 1;
          });

          tr.addEventListener('click', () => {
            window.location.href = `/detalhes-pedidos?idPedido=${pedido.idPed}&idProduto=${pedido.idProduto}`;
          });
        }
      }

      function aplicarFiltros() {
        const inicio = filtroDataInicio.value;
        const fim = filtroDataFim.value;
        const statusSelecionado = filtroStatus.value;

        const filtrados = pedidos.filter(pedido => {
          const dataPedido = new Date(pedido.createdAt);
          const dataISO = dataPedido.toISOString().split('T')[0];

          const dataOk = (!inicio || dataISO >= inicio) && (!fim || dataISO <= fim);
          const statusOk = statusSelecionado === "Todos" || pedido.statusPed === statusSelecionado;
          return dataOk && statusOk;
        });

        renderPedidos(filtrados);
      }

      const frases = [
        "Preparando seu painel...",
        "Carregando os pedidos...",
        "Organizando as informações...",
        "Quase lá...",
        "Finalizando carregamento..."
      ];
      let fraseIndex = 0;
      setInterval(() => {
        loadingFrase.textContent = frases[fraseIndex];
        fraseIndex = (fraseIndex + 1) % frases.length;
      }, 2000);

      function limparFiltros() {
        filtroDataInicio.value = '';
        filtroDataFim.value = '';
        filtroStatus.value = 'Todos';
        aplicarFiltros();
      }

      filtroDataInicio.addEventListener('change', aplicarFiltros);
      filtroDataFim.addEventListener('change', aplicarFiltros);
      filtroStatus.addEventListener('change', aplicarFiltros);
      btnLimparFiltros.addEventListener('click', limparFiltros);

    try {
        const response = await fetch('/pedidos-cadastrados');
        const data = await response.json();
        pedidos = data.pedidos;
        const aguardando = pedidos.filter(p => p.statusPed === 'Aguardando');
        document.getElementById('pedidos-recebidos').textContent = aguardando.length;
        aplicarFiltros();
    } catch (error) {
          console.error('Erro ao buscar pedidos:', error);
        } finally {  
          loading.style.display = 'none';
    }
});

const graficaId = 1; // ou de onde você pegar o ID
const recipientId = 123; // id do recipient no Pagar.me
    
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

document.getElementById('sacar-disponivel').addEventListener('click', async () => {
  const confirmacao = confirm('Deseja sacar o valor disponível para saque agora?');
  if (!confirmacao) return;

  const res = await fetch(`/api/full-balance-grafica?graficaId=${graficaId}`);
  const data = await res.json();
  const valor = parseFloat(data.valorComDesconto);

  try {
    const saque = await fetch('/api/withdraw-grafica', {
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
});

document.getElementById('sacar-total').addEventListener('click', async () => {
  const confirmacao = confirm('Deseja sacar o saldo total (sem considerar elegibilidade)?');
  if (!confirmacao) return;

  const res = await fetch(`/api/full-balance-grafica?graficaId=${graficaId}`);
  const data = await res.json();
  const valor = parseFloat(data.valorComDesconto);

  try {
    const saque = await fetch('/api/full-withdraw-grafica', {
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
});

carregarSaldos();
    
    const links = document.querySelectorAll('.sidebar nav a');
    const sections = document.querySelectorAll('.section');
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.dataset.section;
            sections.forEach(sec => sec.classList.remove('active'));
            sections.forEach(sec => sec.style.display = 'none');
            document.getElementById(target).classList.add('active');
            document.getElementById(target).style.display = 'block';
      });
    });

    const filtroData = document.getElementById('filtro-data');
    const filtroStatus = document.getElementById('filtro-status');

    function filtrarPedidos() {
        const data = filtroData.value;
        const status = filtroStatus.value;
      const filtrado = pedidos.filter(p => {
          const dataOk = !data || p.data === data;
          const statusOk = !status || p.status === status;
          return dataOk && statusOk;
        });
        renderPedidos(filtrado);
    }
    
    filtroData.addEventListener('change', filtrarPedidos);
    filtroStatus.addEventListener('change', filtrarPedidos);