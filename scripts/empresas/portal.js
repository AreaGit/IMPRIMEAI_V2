function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }

  return null; // Retorna null caso o cookie não seja encontrado
}
let userId;
async function exibirSaldoUsuario() {
  try {
      const response = await fetch('/saldoUsuario-empresas');
      const data = await response.json();
      saldoUser.textContent = data.saldo.toFixed(2);
  } catch (error) {
      console.error('Erro ao buscar saldo do usuário:', error);
  }
}
exibirSaldoUsuario();
userId = getCookie("userId");
document.addEventListener('DOMContentLoaded', () => {
  // Fazendo a requisição para a API
  fetch(`/categorias-produtos-usuario/${userId}`)
  .then(response => response.json())
  .then(data => {
    if (data.categorias) {
      const ul = document.querySelector('.categorias-container ul');
      data.categorias.forEach(categoria => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `/cpq/categorias?categoria=${categoria.toLowerCase().replace(/\s+/g, '-')}`; // Ajuste do link para categorias // Defina o link da categoria conforme necessário
        a.textContent = categoria;

        const imagem = document.createElement('img');
        const imageUrl = `../../images/CPQ_IMAGES/${categoria.toLowerCase().replace(/\s+/g, '-')}.png`;  // Caminho para a imagem
        imagem.src = imageUrl;  // Define a imagem a partir do caminho
        imagem.alt = categoria;
        imagem.style.width = '50px';
        imagem.style.height = '50px';

        a.style.display = "inline-block";

        li.appendChild(imagem);
        li.appendChild(a);
        ul.appendChild(li);
      });
    } else {
      console.log("Nenhuma categoria encontrada.");
    }
  })
  .catch(error => {
    console.error("Erro ao fazer a requisição:", error);
  });
  /*fetch(`/api-produtos/cpq`)
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
    });*/
});
// Pega o username do cookie
const username = getCookie('userCad');
const nameUserLog = document.getElementById('nameUserLog');
  // Limita o texto a 40 caracteres
  const limitedUsername = username.length > 20 ? `${username.slice(0, 20)}...` : username;
  nameUserLog.textContent = limitedUsername;

  async function obterQuantidadeCarrinho() {
    try {
        // Fazer uma requisição para a rota /api/carrinho
        const response = await fetch('/api/carrinho');
        const carrinho = await response.json();
        
        // Calcular a quantidade total de produtos no carrinho
        const quantidadeTotal = carrinho.length;
        
        // Exibir a quantidade total no elemento com id 'quantidadeCarrinho'
        document.getElementById('quantidadeCarrinho').textContent = quantidadeTotal;
    } catch (error) {
        console.error('Erro ao obter a quantidade de produtos no carrinho:', error);
    }
  }
  document.getElementById('quantidadeCarrinho').addEventListener('click', () => {
    window.location.href = '/cpq/carrinho'
  });
  // Chamar a função ao carregar a página
  document.addEventListener('DOMContentLoaded', obterQuantidadeCarrinho);

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestionsContainer');

    async function fetchSuggestions(searchText) {
        try {
            const response = await fetch('/pesquisar-produtos-cpq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: searchText })
            });

            const data = await response.json();
            suggestionsContainer.innerHTML = ''; // Limpa as sugestões anteriores
            suggestionsContainer.style.display = 'block'; // Mostra a lista

            if (data.produtos && data.produtos.length > 0) {
                const list = document.createElement('ul'); // Cria a lista dentro da div
                data.produtos.forEach(produto => {
                    const listItem = document.createElement('li');
                    listItem.textContent = produto.nomeProd;
                    listItem.addEventListener('click', () => {
                        window.location.href = `/cpq/detalhes-produtos?id=${produto.id}`;
                    });
                    list.appendChild(listItem);
                });
                suggestionsContainer.appendChild(list); // Adiciona a lista na div
            } else {
                suggestionsContainer.textContent = 'Nenhum produto encontrado.';
            }
        } catch (error) {
            console.error('Erro ao pesquisar produtos:', error);
            suggestionsContainer.textContent = 'Erro ao buscar produtos.';
        }
    }

    // Quando o usuário digitar no campo de pesquisa
    searchInput.addEventListener('input', async () => {
        const searchText = searchInput.value.trim();

        if (searchText === '') {
            suggestionsContainer.style.display = 'none';
            return;
        }

        await fetchSuggestions(searchText); // Busca as sugestões
    });

    // Impede o envio do formulário ao apertar Enter
    document.querySelector('.search-bar').addEventListener('submit', (e) => {
        e.preventDefault();
    });
});
document.addEventListener('DOMContentLoaded', () => {
  const categorias = document.getElementById('categorias');
  const categoriaContainer = document.getElementById('categoriaContainer');
  const categoriaDesp = document.getElementById('categoriaD-ESP');
  const produtosContainer = document.getElementById('produtosContainer');

  // Exibir ou ocultar o container de categorias ao clicar em "Categorias"
  categorias.addEventListener('click', () => {
      categoriaContainer.style.display =
          categoriaContainer.style.display === 'block' ? 'none' : 'block';
  });

  // Exibir os produtos ao lado ao clicar em "D-ESP"
  categoriaDesp.addEventListener('click', () => {
      produtosContainer.style.display = 'block';
  });

  // Fecha o container de categorias ao clicar fora
  document.addEventListener('click', (e) => {
      if (!e.target.closest('#menuContainer') && !e.target.closest('#categorias')) {
          categoriaContainer.style.display = 'none';
          produtosContainer.style.display = 'none';
      }
  });
});

document.getElementById('logo').addEventListener('click', () => {
  window.location.href = '/cpq/inicio'
});