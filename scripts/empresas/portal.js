document.addEventListener('DOMContentLoaded', () => {
  fetch(`/api-produtos/cpq`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar os produtos.');
      }
      return response.json();
    })
    .then((produtos) => {
      const produtosContainer = document.querySelector('.produtos');
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
      //alert('Erro ao carregar produtos.');
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
const nameUserLog = document.getElementById('nameUserLog');
  // Limita o texto a 40 caracteres
  const limitedUsername = username.length > 20 ? `${username.slice(0, 20)}...` : username;
  nameUserLog.textContent = limitedUsername;