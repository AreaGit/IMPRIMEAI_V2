const avisoAdicionadoaoCarrinho = document.getElementById('avisoGeral');
const erroCarrinho = document.getElementById('erroCarrinho');
document.addEventListener('DOMContentLoaded', function() {
    // Obtenha o ID do produto da URL atual (por exemplo, /detalhes-produtos.html?id=1)
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    // Faça uma solicitação AJAX para obter os detalhes do produto com base no ID
    fetch(`/produto/${produtoId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Produto não encontrado');
            }
            return response.json();
        })
        .then(data => {
                // Atualizar o DOM com os detalhes do produto
                const nomeProdutoElement = document.querySelector('#detalhes-produto h1');
                const precoProdutoElement = document.querySelector('#detalhes-produto p');
                const descricaoProdutoElement = document.querySelector('#descricao-produto p');
                const imagemProdutoElement = document.querySelector('#img-produto img')

                nomeProdutoElement.textContent = data.nomeProd;
                precoProdutoElement.textContent = `R$ ${data.valorProd.toFixed(2)}`;
                descricaoProdutoElement.textContent = data.descProd;
                imagemProdutoElement.src = `/imagens/${data.id}`;
        })
        .catch(error => {
            console.error('Erro ao carregar detalhes do produto:', error);
            // Exiba uma mensagem de erro na página
            const errorMessageElement = document.createElement('p');
            errorMessageElement.textContent = 'Produto não encontrado';
        });
});
// Função para carregar as variações do produto
async function carregarVariacoesDoProduto() {
    try {
        const params = new URLSearchParams(window.location.search);
        const produtoId = params.get('id');
        // Faça uma solicitação AJAX para obter as variações do produto com base no ID
        const responseVar = await fetch(`/variacoes-produto/${produtoId}`);
        const variacoes = await responseVar.json();

        // Verifica se existem variações antes de continuar
        if (variacoes && variacoes.length > 0) {
            // Chame a função para criar os selects
            criarSelect(variacoes, 'material', 'Material');
            criarSelect(variacoes, 'formato', 'Formato');
            criarSelect(variacoes, 'cor', 'Cor');
            criarSelect(variacoes, 'enobrecimento', 'Enobrecimento');
            criarSelect(variacoes, 'acabamento', 'Acabamento');
        } else {
            console.error('Nenhuma variação encontrada para o produto.');
        }
    } catch (error) {
        console.error('Erro ao carregar variações do produto:', error);
    }
}

// Função para criar os selects
function criarSelect(variacoes, tipo, labelText) {
    // Obtém a seção onde o select será adicionado
    const secao = document.getElementById('variacoes');
    
     // Cria a label correspondente
     const label = document.createElement('label');
     label.textContent = labelText;
     secao.appendChild(label);
 
     // Cria um select element
     const select = document.createElement('select');
     select.name = tipo;
     select.id = tipo;
 
     // Itera sobre as variações para criar os options
     variacoes.forEach(variacao => {
         try {
             // Remove barras invertidas duplicadas e formata a string removendo colchetes e aspas
             const valorFormatado = variacao[tipo].replace(/\\+/g, '').replace(/[\[\]"']/g, '');
 
             // Quebra os valores de acordo com as vírgulas
             const valoresQuebrados = valorFormatado.split(',');
 
             // Adiciona cada valor quebrado como uma opção no formato correto
             valoresQuebrados.forEach((valorQuebrado, index) => {
                 const option = document.createElement('option');
                 option.value = valorQuebrado.trim(); // Remove espaços em branco adicionais
                 option.text = valorQuebrado.trim();
                 if (index === 0) {
                     // Define o primeiro option como selecionado
                     option.selected = true;
                 }
                 select.add(option);
             });
         } catch (error) {
             console.error('Erro ao processar variação:', error);
         }
     });
 
     // Adiciona o select à seção
     secao.appendChild(select);
}

// Chame a função
carregarVariacoesDoProduto();

const adicionarAoCarrinhoBtn = document.getElementById('adicionarAoCarrinhoBtn');
const inputQuantidade = document.getElementById('quantidade');
// Lida com o clique no botão "Adicionar ao Carrinho"
adicionarAoCarrinhoBtn.addEventListener('click', async () => {
    try {
      // Obtenha a quantidade escolhida pelo usuário
      const quantidade = parseInt(inputQuantidade.value);

      // Verifique se a quantidade é válida (maior que 0)
      if (quantidade <= 0) {
        alert('Por favor, escolha uma quantidade válida maior que 0.');
        return;
      }

    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');
    const materialSelecionado = document.getElementById('material').value;
    const formatoSelecionado = document.getElementById('formato').value;
    const corSelecionada = document.getElementById('cor').value;
    const enobrecimentoSelecionado = document.getElementById('enobrecimento').value;
    const acabamentoSelecionado = document.getElementById('acabamento').value;

    const variacoesSelecionadas = {
      idProduto: produtoId,
      material: materialSelecionado,
      formato: formatoSelecionado,
      cor: corSelecionada,
      enobrecimento: enobrecimentoSelecionado,
      acabamento: acabamentoSelecionado
    };
      // Faça uma solicitação POST para adicionar o produto ao carrinho
      const response = await fetch(`/adicionar-ao-carrinho/${produtoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantidade, ...variacoesSelecionadas })
      });

      if (response.ok) {
        // Produto adicionado com sucesso ao carrinho
        avisoAdicionadoaoCarrinho.style.display = 'block';
        setTimeout(() => {
          avisoAdicionadoaoCarrinho.style.display = 'none';
        }, 5000);
        // Limpe o campo de entrada de quantidade
        inputQuantidade.value = '1';
      } else {
        // Trate qualquer erro de adição ao carrinho
        erroCarrinho.style.display = 'block';
        setTimeout(() => {
          erroCarrinho.style.display = 'none';
        }, 5000);
        //alert('Erro ao adicionar o produto ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar o produto ao carrinho:', error);
      //alert('Erro ao adicionar o produto ao carrinho');
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Obtenha o ID do produto da URL atual (por exemplo, /detalhes-produtos.html?id=1)
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');

    // Seletor do campo de entrada de número
    const inputQuantidade = document.getElementById('quantidade');
    
    // ...

    // Seletor do botão "Avançar"
    const avancarBtn = document.getElementById('lnk-comp');
    
    // Lida com o clique no botão "Avançar"
    avancarBtn.addEventListener('click', async () => {
            try {
      // Obtenha a quantidade escolhida pelo usuário
      const quantidade = parseInt(inputQuantidade.value);

      // Verifique se a quantidade é válida (maior que 0)
      if (quantidade <= 0) {
        alert('Por favor, escolha uma quantidade válida maior que 0.');
        return;
      }

    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');
    const materialSelecionado = document.getElementById('material').value;
    const formatoSelecionado = document.getElementById('formato').value;
    const corSelecionada = document.getElementById('cor').value;
    const enobrecimentoSelecionado = document.getElementById('enobrecimento').value;
    const acabamentoSelecionado = document.getElementById('acabamento').value;

    const variacoesSelecionadas = {
      idProduto: produtoId,
      material: materialSelecionado,
      formato: formatoSelecionado,
      cor: corSelecionada,
      enobrecimento: enobrecimentoSelecionado,
      acabamento: acabamentoSelecionado
    };

    console.log('Variações Selecionadas', variacoesSelecionadas);


      // Faça uma solicitação POST para adicionar o produto ao carrinho
      const response = await fetch(`/adicionar-ao-carrinho/${produtoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantidade, ...variacoesSelecionadas })
      });

      if (response.ok) {
        // Produto adicionado com sucesso ao carrinho
        console.log(`Produto (ID ${produtoId}) adicionado ao carrinho com quantidade ${quantidade}.`);
        // Limpe o campo de entrada de quantidade
        inputQuantidade.value = '1';
        window.location.href = '/carrinho'
        avisoAdicionadoaoCarrinho.style.display = 'block';
        setTimeout(() => {
          avisoAdicionadoaoCarrinho.style.display = 'none';
        }, 5000);
      } else {
        // Trate qualquer erro de adição ao carrinho
        erroCarrinho.style.display = 'block';
        setTimeout(() => {
          erroCarrinho.style.display = 'none';
        }, 5000);
       // alert('Erro ao adicionar o produto ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar o produto ao carrinho:', error);
      //alert('Erro ao adicionar o produto ao carrinho');
    }
    });
});