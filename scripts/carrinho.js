const carrinhoVazio = document.getElementById('carrinho-vazio');
const totalCarrinho = document.getElementById('totalCarrinho');
const resumoCompra = document.getElementById('resumo-compra');
document.addEventListener('DOMContentLoaded', function() {
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
                      const imgResponse = await fetch(`/imagens/${idDoProduto}`);
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
  btnEnviarCupom.addEventListener('click', async () => {
    async function atualizarTotalAPagar() {
      const inputCupom = document.getElementById('cupom');
      const cupom = inputCupom.value.trim(); // Remove espaços em branco extras
      const avisoGeral = document.getElementById('avisoGeral');
      const erroCarrinho = document.getElementById('erroCarrinho');
      
      try {
          // Faça uma solicitação AJAX para verificar e aplicar o cupom
          const response = await fetch(`/aplicar-desconto-cupom/${cupom}`);
          if (!response.ok) {
              throw new Error('Erro ao aplicar o cupom');
          }
  
          const data = await response.json();
          const novoValorTotal = data.novoValorTotal;
  
          // Atualize a exibição do total a pagar com o novo valor total do carrinho
          const totalAPagarElement = document.getElementById('totalComp');
          const totalAPagarElement2 = document.getElementById('total');
          const totalAPagarElement3 = document.getElementById('subTotal');
          totalAPagarElement.textContent = "R$ " + novoValorTotal.toFixed(2);
          totalAPagarElement2.textContent = novoValorTotal.toFixed(2);
    
          avisoGeral.style.display = 'block'
          setTimeout(() => {
            avisoGeral.style.display = 'none'
            window.location.reload();
          }, 5000);
      } catch (error) {
        erroCarrinho.style.display = 'block'
        setTimeout(() => {
          erroCarrinho.style.display = 'none'
          window.location.reload();
        }, 3000);
      }
    }
  
    atualizarTotalAPagar(); // Chamada imediata da função após a definição
  });  

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
const userId = getCookie('userId');
console.log(userId);
  
btnAvancar.addEventListener('click', () => {
  if(userId == null) {
    window.location.href = '/cadastro';
  }else {
    window.location.href = '/upload';
  }    
});
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
  // Função para pegar o cookie pelo nome
  function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Pega o username do cookie
  const username = getCookie('username');
  // Seleciona os elementos
  const conviteCad = document.getElementById('conviteCad');
  const userLog = document.getElementById('userLog');
  const nameUserLog = document.getElementById('nameUserLog');

      if (username === undefined) {
          // Mostra o convite para cadastrar e esconde a área logada
          conviteCad.style.display = 'block';
          userLog.style.display = 'none';
      } else {
          // Esconde o convite e mostra o nome do usuário
          conviteCad.style.display = 'none';
          userLog.style.display = 'block';
          nameUserLog.textContent = username;
      }
});