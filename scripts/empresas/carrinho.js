const carrinhoVazio = document.getElementById('carrinho-vazio');
const totalCarrinho = document.getElementById('totalCarrinho');
const resumoCompra = document.getElementById('resumo-compra');
document.addEventListener('DOMContentLoaded', function() {
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
  
  document.getElementById('btnVoltar').addEventListener('click', () => {
    if(document.referrer) {
        window.history.back();
    } else {
        window.location.href = "/"
    }
  })
    // Função para carregar e exibir os produtos do carrinho
    async function carregarProdutosCarrinho() {
      try {
        // Faça uma solicitação AJAX para obter os produtos do carrinho
        const response = await fetch('/api/carrinho');
  
        if (!response.ok) {
          throw new Error('Erro ao obter os dados do carrinho');
        }
  
        // Obtenha os dados do carrinho em formato JSON
        const produtos = await response.json();
        const carrinhoProdutos = document.getElementById('carrinhoProdutos');
        const conteudo = document.getElementById('conteudo')
  
        // Limpe os produtos existentes no carrinho
        carrinhoProdutos.innerHTML = '';
        
        
  
  
        // Verifique se há produtos no carrinho
        if (produtos.length === 0) {
            carrinhoVazio.style.display = 'block'
            totalCarrinho.style.display = 'none'
            resumoCompra.style.display = 'none'
          } else {
            carrinhoVazio.style.display = 'none';
            totalCarrinho.style.display = 'block';
            resumoCompra.style.display = 'block';
    
            for (const produto of produtos) {
              const produtoElement = document.createElement('div');
              produtoElement.classList.add('produto-carrinho');
    
              // Fetch the image URL for the product
              const idDoProduto = produto.produtoId
              const srcDaImagem = await pegarImagemDoProduto(idDoProduto);
    
              console.log(srcDaImagem);
              produto.nomeProd = produto.nomeProd.substring(0, 40)
              produtoElement.innerHTML = `
                <img src="${srcDaImagem}" alt="Imagem do Produto">
                <h2 class="nomeProduto">${produto.nomeProd}</h2>
                <p class="qnt">Quantidade: ${produto.quantidade}</p>
                <p class="sub">R$ ${produto.subtotal.toFixed(2)}</p>
                <button class="remover-produto" data-produto-id="${produto.produtoId}">Remover</button>
              `;
    
              carrinhoProdutos.appendChild(produtoElement);
                // Função para obter a URL da imagem do produto
                async function pegarImagemDoProduto(idDoProduto) {
                  try {
                      const imgResponse = await fetch(`/imagens-empresa/${idDoProduto}`);
                      if (!imgResponse.ok) {
                          throw new Error('Erro ao obter a URL da imagem do produto');
                      }
                      const imgData = await imgResponse.json();
                      return imgData.imgProdUrl;
                  } catch (error) {
                      console.error('Erro ao carregar a imagem:', error);
                      return null;
                  }
                }
    
              const removerProdutoBtn = produtoElement.querySelector('.remover-produto');
              removerProdutoBtn.addEventListener('click', async () => {
                const produtoId = removerProdutoBtn.getAttribute('data-produto-id');
    
                try {
                  // Faça uma solicitação AJAX para remover o produto do carrinho
                  const response = await fetch(`/remover-do-carrinho/${produtoId}`, {
                    method: 'DELETE',
                  });
    
                  if (response.ok) {
                    // Produto removido com sucesso do carrinho
                    // Atualize a visualização do carrinho após a remoção
                    location.reload();
                    carregarProdutosCarrinho();
                  } else {
                    throw new Error('Erro ao remover o produto do carrinho');
                  }
                } catch (error) {
                  console.error('Erro ao remover o produto do carrinho:', error);
                }
              });
            }
          }
        } catch (error) {
          console.error('Erro ao carregar produtos do carrinho:', error);
        }
      }
    
      // Chame a função para carregar os produtos do carrinho quando a página for carregada
      carregarProdutosCarrinho();
    });
  function atualizarTotalAPagar() {
    const totalAPagarElement = document.getElementById('totalComp');
    const totalAPagarElement2 = document.getElementById('total');
    const totalAPagarElement3 = document.getElementById('subTotal');
    const valorDescontoElement = document.getElementById('totalDesconto');
  
    // Faça uma solicitação AJAX para obter os produtos do carrinho
    fetch('/api/carrinho')
      .then(response => response.json())
      .then(produtos => {
        // Verifique se algum produto possui desconto aplicado
        const descontoAplicado = produtos.some(produto => produto.descontado === true);
        const cupomDesconto = document.getElementById('cupomDesconto');
        // Calcule a soma dos valores dos produtos no carrinho
        const totalAPagar = produtos.reduce((total, produto) => total + (produto.quantidade * produto.valorUnitario), 0);
        
        // Se algum produto tiver desconto aplicado, exiba o novo total considerando o desconto
        if (descontoAplicado) {
          const novoTotalAPagar = totalAPagar * 0.95; // Aplicar desconto de 5%
          const desconto = totalAPagar - novoTotalAPagar; // Calcular o valor do desconto
          const porcentagemDesconto = (desconto / totalAPagar) * 100; // Calcular a porcentagem do desconto
          totalAPagarElement.textContent = "R$ " + novoTotalAPagar.toFixed(2);
          totalAPagarElement2.textContent = novoTotalAPagar.toFixed(2);
          totalAPagarElement3.textContent = "R$ " + totalAPagar.toFixed(2);
          valorDescontoElement.textContent = "R$ " + desconto.toFixed(2); // Exibir o valor do desconto em reais
          cupomDesconto.style.display = 'none'
        } else {
          // Caso contrário, exiba o total sem desconto
          totalAPagarElement.textContent = "R$ " + totalAPagar.toFixed(2);
          totalAPagarElement2.textContent = totalAPagar.toFixed(2);
          totalAPagarElement3.textContent = "R$ " + totalAPagar.toFixed(2);
          valorDescontoElement.textContent = "R$ 0.00";
        }
      })
      .catch(error => {
        console.error('Erro ao calcular o total a pagar:', error);
      });
}
  // Chame a função para calcular e atualizar o total a pagar quando necessário
  // Por exemplo, após adicionar ou remover um produto do carrinho
  atualizarTotalAPagar();
  function atualizarTotalItens() {
    const totalItensElement = document.getElementById('totalItens');
    
    // Faça uma solicitação AJAX para obter os produtos do carrinho
    fetch('/api/carrinho')
      .then(response => response.json())
      .then(produtos => {
        // Calcule o número total de itens somando as quantidades de todos os produtos
        const numeroTotalItens = produtos.reduce((total, produto) => total + produto.quantidade, 0);
        
        // Atualize o elemento HTML com o número total de itens
        totalItensElement.textContent = numeroTotalItens;
      })
      .catch(error => {
        console.error('Erro ao atualizar o número total de itens:', error);
      });
  }
  
  // Chame a função para atualizar o número total de itens quando necessário
  // Por exemplo, após adicionar ou remover um produto do carrinho
  atualizarTotalItens();

const btnEnviarCupom = document.getElementById('btnEnviarCupom');

if (btnEnviarCupom) {
  btnEnviarCupom.addEventListener('click', async () => {
    const inputCupom = document.getElementById('cupom');
    const avisoGeral = document.getElementById('avisoGeral');
    const erroCarrinho = document.getElementById('erroCarrinho');
    const totalAPagarElement = document.getElementById('totalComp');
    const totalAPagarElement2 = document.getElementById('total');
    const totalAPagarElement3 = document.getElementById('subTotal');

    if (!inputCupom) return console.error('Campo de cupom não encontrado.');

    const cupom = inputCupom.value.trim().toUpperCase();

    if (!cupom) {
      erroCarrinho.textContent = 'Digite um cupom antes de aplicar.';
      erroCarrinho.style.display = 'block';
      setTimeout(() => (erroCarrinho.style.display = 'none'), 3000);
      return;
    }

    try {
      const response = await fetch(`/aplicar-desconto-cupom/${cupom}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao aplicar o cupom');
      }

      // Cupom FRETE100 (frete grátis)
      if (data.frete === 0 && data.mensagem) {
        avisoGeral.textContent = data.mensagem;
        avisoGeral.style.display = 'block';
        setTimeout(() => {
          avisoGeral.style.display = 'none';
          window.location.reload();
        }, 3000);
        return;
      }

      // Cupom de desconto comum (ex: JORGE RAMOS)
      if (typeof data.novoValorTotal === 'number') {
        const novoValor = data.novoValorTotal.toFixed(2);
        if (totalAPagarElement) totalAPagarElement.textContent = 'R$ ' + novoValor;
        if (totalAPagarElement2) totalAPagarElement2.textContent = novoValor;
        if (totalAPagarElement3) totalAPagarElement3.textContent = novoValor;

        avisoGeral.textContent = 'Cupom aplicado com sucesso!';
        avisoGeral.style.display = 'block';
        setTimeout(() => {
          avisoGeral.style.display = 'none';
          window.location.reload();
        }, 3000);
      } else {
        throw new Error('Cupom inválido ou sem valor retornado.');
      }

    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      erroCarrinho.textContent = 'Cupom inválido ou erro no servidor.';
      erroCarrinho.style.display = 'block';
      setTimeout(() => (erroCarrinho.style.display = 'none'), 3000);
    }
  });
} 

  const btnAvancar = document.getElementById('btnAvancar');
  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
    }
}
    return null;
}
     
// Ler o valor do cookie 'userCad'
/*const userId = getCookie('userId');
console.log(userId);
  
btnAvancar.addEventListener('click', () => {
  if(userId == null) {
    window.location.href = '/cadastro';
  }else {
    window.location.href = '/upload';
  }    
});*/
btnAvancar.addEventListener('click', () => {
  window.location.href = '/formato-entrega'
})
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
  window.location.href = '/carrinho'
});
// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', obterQuantidadeCarrinho);

document.addEventListener("DOMContentLoaded", async () => {
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
});

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
/*document.addEventListener('DOMContentLoaded', () => {
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
});*/

document.getElementById('logo').addEventListener('click', () => {
window.location.href = '/cpq/inicio'
});