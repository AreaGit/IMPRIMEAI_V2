fetch('/api/empresa/nome')
  .then(response => response.json())
  .then(data => {
    if (data.empresa) {
      const empresa = data.empresa;
      document.querySelector('.voltarPortal').addEventListener("click", () => {
        window.location.href = `/${empresa}/inicio`;
      });
      document.getElementById('cart').addEventListener("click", () => {
        window.location.href = `/${empresa}/carrinho`;
      });
    } else {
      console.error("Nome da empresa não encontrado na resposta.");
    }
  })
  .catch(error => console.error('Erro ao buscar o nome da empresa:', error));
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/empresa/logo', {
      method: 'GET',
      credentials: 'include', // Inclui cookies na requisição
    })
      .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar a logo da empresa.');
      }
      return response.json();
    })
    .then((data) => {
    // Define o caminho da logo na imagem
    const logoElement = document.querySelector('.logoLoja img');
    if (data.logo) {
      logoElement.src = data.logo;
    } else {
      window.location.href = '/empresas/login';
    }
  })
  .catch((error) => {
      console.error('Erro ao carregar a logo:', error);
      window.location.href = '/empresas/login';
      alert('Erro ao carregar a logo da empresa.');
  });
});
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }

  return null; // Retorna null caso o cookie não seja encontrado
}

// Pega o username do cookie
const username = getCookie('userCad');
// Seleciona os elementos
const conviteCad = document.getElementById('conviteCad');
const userLog = document.getElementById('userLog');
const nameUserLog = document.getElementById('nameUserLog');

if (!username) {
  // Mostra o convite para cadastrar e esconde a área logada
  conviteCad.style.display = 'block';
  userLog.style.display = 'none';
} else {
  // Limita o texto a 40 caracteres
  const limitedUsername = username.length > 20 ? `${username.slice(0, 20)}...` : username;

  // Esconde o convite e mostra o nome do usuário
  conviteCad.style.display = 'none';
  userLog.style.display = 'block';
  nameUserLog.textContent = limitedUsername;
}
document.addEventListener('DOMContentLoaded', () => {
  fetch(`/api-produtos/empresa`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar os produtos.');
      }
      return response.json();
    })
    .then((produtos) => {
      const produtosContainer = document.getElementById('produtos');
      produtosContainer.innerHTML = '';

      produtos.forEach((produto) => {
        const produtoElement = document.createElement('div');
        produtoElement.classList.add('cxProd');
        produtoElement.addEventListener('click', () => {
          window.location.href = `detalhes-produtos?id=${produto.id}`;
        });
        produtoElement.innerHTML = `
          <img src="${produto.imgProd}" alt="${produto.nomeProd}">
          <h3>${produto.nomeProd}</h3>
          <p>R$ ${produto.valorProd.toFixed(2)}</p>
          <a href="detalhes-produtos?id=${produto.id}">Comprar</a>
        `;
        produtosContainer.appendChild(produtoElement);
      });
    })
    .catch((error) => {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos.');
    });
});
