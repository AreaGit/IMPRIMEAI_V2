document.addEventListener('DOMContentLoaded', () => {
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
    // Função para obter o valor de um parâmetro da URL
    function getParametroUrl(nome) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nome);
    }

    // Função para definir o título da página com base na categoria
    function definirTituloCategoria() {
        const categoria = getParametroUrl('categoria') || 'Produtos'; // Valor padrão
        const categoriaFormatada = categoria.replace('-', ' '); // Formatação
        document.title = categoriaFormatada[0].toUpperCase() + categoriaFormatada.substring(1); // Altera o title da página
    }
    let categoria = getParametroUrl('categoria') || 'Nenhum'; // Valor padrão
    if(categoria == "cardapios") {
        categoria = "Cardápios"
    } else if(categoria == "banners") {
        categoria = "Banners";
    } else if(categoria == "frente-de-caixa") {
        categoria = "Frente de Caixa"
    } else if(categoria == "mini-menu") {
        categoria = "Mini Menu"
    }
    fetch(`/api/produtos-empresas/${categoria}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao carregar os produtos.');
        }
        return response.json();
      })
      .then((produtos) => {
        console.log(produtos)
        const produtosContainer = document.querySelector('.produtos');
        produtosContainer.innerHTML = '';
  
        // Renderiza os produtos
        produtos.produtos.produtos.forEach(produto => {
            const produtoDiv = document.createElement('div');
            produtoDiv.classList.add('cxProd');
            produtoDiv.addEventListener("click", () => {
                window.location.href = `/cpq/detalhes-produtos?id=${produto.id}`;
            })
            produto.nomeProd = produto.nomeProd.substring(0, 40)
            produtoDiv.innerHTML = `
                <img src="${produto.imgProd}" alt="${produto.nomeProd}">
                <h3>${produto.nomeProd}</h3>
                <p>R$ ${produto.valorProd.toFixed(2)}</p>
                <a href="detalhes-produtos?id=${produto.id}">Comprar</a>
            `;
            produtosContainer.appendChild(produtoDiv);
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
  
  document.getElementById('logo').addEventListener('click', () => {
    window.location.href = '/cpq/inicio'
  });


  document.getElementById('btnVoltar').addEventListener('click', () => {
    if(document.referrer) {
        window.history.back();
    } else {
        window.location.href = "/"
    }
  })