function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Exibir o nome do usuário no elemento com id 'nomeAdm'
document.addEventListener('DOMContentLoaded', () => {
    const nomeAdmElement = document.getElementById('nomeAdm');
    const userName = getCookie('usernameAdm');
    if (userName) {
        //nomeAdmElement.textContent = userName;
    } else {
        window.location.href = '/login-adm';
    }
});


const menuLinks = document.querySelectorAll('.sidebar nav ul li a');
const sections = document.querySelectorAll('.section');

menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-section');
    sections.forEach(section => section.classList.remove('active'));
    
    if (!target) {
      showWelcomeMessage();
      return;
    }

    document.getElementById(target).classList.add('active');

    if(target === 'welcome') showWelcomeMessage();
    if (target === 'produtos') loadProdutos();
    if (target === 'graficas') loadGraficas();
    if (target === 'pedidos') loadPedidos();
    if (target === 'usuarios') loadUsers();
  });
});

document.getElementById('inicio').addEventListener('click', () => {
  showWelcomeMessage();
  document.getElementById('welcome').style.display = 'block';
});

function showWelcomeMessage() {
  document.getElementById('pedidos').style.display = 'none';
  document.getElementById('graficas').style.display = 'none';
  document.getElementById('produtos').style.display = 'none';
  document.getElementById('usuarios').style.display = 'none';
}

function carregarNome() {
  let name = document.getElementById('name');
  name.textContent = getCookie("usernameAdm");
};

carregarNome();

async function loadProdutos() {
  const tbody = document.getElementById('produtos-body');
  document.getElementById('welcome').style.display = 'none';
  tbody.innerHTML = '';
  const res = await fetch('/api/produtos');
  const produtos = await res.json();

  produtos.forEach(produto => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${produto.imgProd}" alt="${produto.nomeProd}" width="50"></td>
      <td>${produto.nomeProd}</td>
      <td>${produto.categProd}</td>
      <td>R$ ${Number(produto.valorProd).toFixed(2)}</td>
      <td style="color: ${produto.status === 'Ativo' ? 'green' : 'red'}">${produto.status}</td>
    `;
    tr.addEventListener('click', () => {
        window.location.href = `/editar-produtos?id=${produto.id}`
    })
    tbody.appendChild(tr);
  });
}

async function loadGraficas() {
  const tbody = document.getElementById('graficas-body');
  document.getElementById('welcome').style.display = 'none';
  tbody.innerHTML = '';
  const res = await fetch('/api/graficas');
  const graficas = await res.json();

  graficas.forEach(grafica => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${grafica.userCad}</td>
      <td>${grafica.cidadeCad} - ${grafica.estadoCad}</td>
      <td>${grafica.emailCad}</td>
      <td>${grafica.telefoneCad}</td>
      <td>
        <select data-id="${grafica.id}" class="status-select">
          <option value="Em análise" ${grafica.status === 'Em análise' ? 'selected' : ''}>Em análise</option>
          <option value="Aprovada" ${grafica.status === 'Aprovada' ? 'selected' : ''}>Aprovada</option>
          <option value="Ativa" ${grafica.status === 'Ativa' ? 'selected' : ''}>Ativa</option>
          <option value="Inativa" ${grafica.status === 'Inativa' ? 'selected' : ''}>Inativa</option>
          <option value="Cancelada" ${grafica.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const novoStatus = e.target.value;

      const res = await fetch(`/api/graficas/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      if(res.ok == true) {
        window.location.reload();
      }
      if (!res.ok) {
        alert('Erro ao atualizar o status!');
      }
    });
  });
}

async function loadPedidos() {
  const tbody = document.getElementById('pedidos-body');
  document.getElementById('welcome').style.display = 'none';
  tbody.innerHTML = '';
  const res = await fetch('/pedidos-todos');
  const data = await res.json();
  const pedidos = data.pedidos;

  pedidos.forEach(pedido => {
    const item = pedido.itenspedidos?.[0];
    const nomeProduto = item?.nomeProd || '-';
    const quantidade = item?.quantidade || '-';
    const statusAtual = pedido.statusPed || item?.statusPed || '-';
    const dataPedido = new Date(pedido.createdAt).toLocaleDateString('pt-BR');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${pedido.id}</td>
      <td>${nomeProduto}</td>
      <td>${quantidade}</td>
      <td>
        <select data-id="${pedido.id}" class="status-select">
          <option value="Aguardando" ${statusAtual === 'Aguardando' ? 'selected' : ''}>Aguardando</option>
          <option value="Pedido Aceito Pela Gráfica" ${statusAtual === 'Pedido Aceito Pela Gráfica' ? 'selected' : ''}>Pedido Aceito Pela Gráfica</option>
          <option value="Finalizado" ${statusAtual === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
          <option value="Pedido Enviado pela Gráfica" ${statusAtual === 'Pedido Enviado pela Gráfica' ? 'selected' : ''}>Pedido Enviado pela Gráfica</option>
          <option value="Pedido Entregue pela Gráfica" ${statusAtual === 'Pedido Entregue pela Gráfica' ? 'selected' : ''}>Pedido Entregue pela Gráfica</option>
        </select>
      </td>
      <td>${dataPedido}</td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = e.target.getAttribute('data-id');
      const novoStatus = e.target.value;
      await fetch(`/atualizar-status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
    });
  });
}

async function loadUsers () {
    const tbody = document.getElementById('usuarios-body');
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.style.display = 'none';
    
    tbody.innerHTML = '';
  
    const res = await fetch('/allusers');
    const data = await res.json();
    const users = data;
  
    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.telefoneCad}</td>
        <td>R$ ${parseFloat(user.balance).toFixed(2)}</td>
      `;
      tr.addEventListener('click', () => {
        window.location.href = `/administradores/editar-usuario?id=${user.id}`
      });
      tbody.appendChild(tr);
    });
};

// Função para deletar usuário
async function deleteUser(userId) {
  if (confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) {
    try {
      const res = await fetch(`/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        alert('Usuário excluído com sucesso.');
        // Atualize a listagem de usuários
        location.reload();
      } else {
        alert(data.message || 'Erro ao excluir usuário.');
      }
    } catch (error) {
      alert('Erro ao excluir usuário.');
      console.error(error);
    }
  }
};

async function filtrarPedidos() {
  const tbody = document.getElementById('pedidos-body');
  document.getElementById('welcome').style.display = 'none';
  tbody.innerHTML = '';

  const dataInicio = document.getElementById('filtroDataInicio').value;
  const dataFim = document.getElementById('filtroDataFim').value;
  const status = document.getElementById('filtroStatus').value;

  const params = new URLSearchParams({
    ...(dataInicio && { dataInicio }),
    ...(dataFim && { dataFim }),
    ...(status && { status })
  });

  const res = await fetch(`/api/pedidos?${params.toString()}`);
  const data = await res.json();
  const pedidos = data;

  pedidos.forEach(pedido => {
    const item = pedido.itenspedidos?.[0];
    const nomeProduto = item?.nomeProd || '-';
    const quantidade = item?.quantidade || '-';
    const status = item?.statusPed || pedido.statusPed || '-';
    const dataPedido = new Date(pedido.createdAt).toLocaleDateString('pt-BR');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${pedido.id}</td>
      <td>${nomeProduto}</td>
      <td>${quantidade}</td>
      <td>${status}</td>
      <td>${dataPedido}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportarPedidos(formato) {
  const url = formato === 'csv' ? '/exportar-pedidos/csv' : '/exportar-pedidos/pdf';
  window.open(url, '_blank');
};

async function carregarResumoGeral() {
  const res = await fetch('/dashboard/resumo-geral');
  const data = await res.json();

  document.getElementById('total-usuarios').textContent = data.totalUsuarios;
  document.getElementById('total-pedidos').textContent = data.totalPedidos;
  document.getElementById('total-saldo').textContent = `R$ ${parseFloat(data.totalSaldoCarteiras).toFixed(2)}`;
}

carregarResumoGeral();

async function carregarGraficoPedidos() {
  const res = await fetch('/dashboard/pedidos-mensais');
  const dados = await res.json();

  const labels = dados.map(d => d.mes);
  const valores = dados.map(d => parseInt(d.quantidade));

  const ctx = document.getElementById('graficoPedidosCanvas').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(2, 87, 45, 0.3)');
  gradient.addColorStop(1, 'rgba(2, 87, 45, 0.05)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Pedidos',
        data: valores,
        fill: true,
        backgroundColor: gradient,
        borderColor: '#015524',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#02572D',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#013D1C',
            font: { size: 14, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: '#015524',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          borderWidth: 1,
          borderColor: '#013D1C'
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#4B5563',
            font: { size: 12 }
          },
          grid: { color: '#E5E7EB' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#4B5563',
            font: { size: 12 }
          },
          grid: { color: '#E5E7EB' }
        }
      }
    }
  });
}

carregarGraficoPedidos();

async function carregarGraficoUsuarios() {
  const res = await fetch('/dashboard/usuarios-mensais');
  const dados = await res.json();

  const labels = dados.map(d => d.mes);
  const valores = dados.map(d => parseInt(d.quantidade));

  const ctx = document.getElementById('graficoUsuariosCanvas').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(1, 85, 36, 0.3)');
  gradient.addColorStop(1, 'rgba(1, 85, 36, 0.05)');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Novos Usuários',
        data: valores,
        backgroundColor: gradient,
        borderColor: '#015524',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#013D1C',
            font: { size: 14, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: '#02572D',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10
        }
      },
      scales: {
        x: {
          ticks: { color: '#4B5563', font: { size: 12 } },
          grid: { color: '#E5E7EB' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#4B5563', font: { size: 12 } },
          grid: { color: '#E5E7EB' }
        }
      }
    }
  });
}

carregarGraficoUsuarios();

async function carregarGraficoCarteira() {
  const res = await fetch('/dashboard/movimentacoes-carteira');
  const dados = await res.json();

  const labels = dados.map(d => d.mes);
  const valores = dados.map(d => d.total);

  const ctx = document.getElementById('graficoCarteiraCanvas').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(2, 87, 45, 0.4)');
  gradient.addColorStop(1, 'rgba(2, 87, 45, 0.05)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Movimentado (R$)',
        data: valores,
        fill: true,
        backgroundColor: gradient,
        borderColor: '#02572D',
        tension: 0.4,
        pointBackgroundColor: '#02572D',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#013D1C',
            font: { size: 14, weight: 'bold' }
          }
        },
        tooltip: {
          backgroundColor: '#02572D',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          callbacks: {
            label: ctx => `R$ ${ctx.raw.toFixed(2).replace('.', ',')}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#4B5563', font: { size: 12 } },
          grid: { color: '#E5E7EB' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#4B5563',
            font: { size: 12 },
            callback: valor => `R$ ${valor.toFixed(2).replace('.', ',')}`
          },
          grid: { color: '#E5E7EB' }
        }
      }
    }
  });
}

carregarGraficoCarteira();

/*async function carregarAdmins() {
  const res = await fetch("/admin/admins");
  const admins = await res.json();
  const lista = document.getElementById("lista-admins");
  lista.innerHTML = "";

  admins.forEach(admin => {
    const div = document.createElement("div");
    div.className = "bg-white border p-4 rounded-xl shadow-md flex justify-between items-center";
    div.innerHTML = `
      <div>
        <strong>${admin.userCad}</strong><br>
        <small>${admin.emailCad}</small>
      </div>
      <button onclick="removerAdmin(${admin.id})" class="text-red-600 hover:underline">Remover</button>
    `;
    lista.appendChild(div);
  });
}

async function removerAdmin(id) {
  if (!confirm("Tem certeza que deseja remover este administrador?")) return;

  await fetch(`/admin/admins/${id}`, { method: "DELETE" });
  carregarAdmins();
}

document.getElementById("formNovoAdmin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const dados = Object.fromEntries(new FormData(form).entries());

  await fetch("/admin/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  form.reset();
  carregarAdmins();
});

carregarAdmins();*/