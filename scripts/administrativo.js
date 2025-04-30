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
        nomeAdmElement.textContent = userName;
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
  let welcomeSection = document.getElementById('welcome');

  if (!welcomeSection) {
    welcomeSection = document.createElement('section');
    welcomeSection.id = 'welcome';
    welcomeSection.className = 'card section active';
    welcomeSection.innerHTML = `
      <h2>Bem-vindo ao Painel Administrativo ${getCookie("usernameAdm")}</h2>
      <p>Use o menu lateral para navegar entre as seções.</p>
    `;
    document.querySelector('.content').appendChild(welcomeSection);
  }

  sections.forEach(section => section.classList.remove('active'));
  welcomeSection.classList.add('active');
}

showWelcomeMessage()

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
    `;
    tr.addEventListener('click', () => {
      window.location.href = `/editar-graficas?id=${grafica.id}`
    });
    tbody.appendChild(tr);
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
}