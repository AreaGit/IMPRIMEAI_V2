const avisoAdicionadoaoCarrinho = document.getElementById('avisoGeral');
const erroCarrinho = document.getElementById('erroCarrinho');
const avancarSlides = document.getElementById('avancarSlides');
const retrocederSlides = document.getElementById('retrocederSlides');
const downloadGab = document.getElementById('downloadGab');
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
                console.log(data)
                // Atualizar o DOM com os detalhes do produto
                const nomeProdutoElement = document.querySelector('#detalhes-produto h1');
                const precoProdutoElement = document.querySelector('#detalhes-produto p');
                const descricaoProdutoElement = document.querySelector('#descricao-produto p');
                const imagemProdutoElement = document.querySelector('#img-produto img')

                nomeProdutoElement.textContent = data.nomeProd;
                precoProdutoElement.textContent = `R$ ${data.valorProd.toFixed(2)}`;
                descricaoProdutoElement.textContent = data.descProd;
                imagemProdutoElement.src = `/imagens/${data.id}`;
                // Evento de download do gabarito
                downloadGab.addEventListener('click', () => {
                  const buffer = new Uint8Array(data.gabaritoProd.data);
                  const blob = new Blob([buffer], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = url;
                  a.download = `${data.nomeProd}_gabarito.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
              });
                  // Update slideshow images
                  const slideshowImages = [
                    data.imgProd,
                    data.imgProd2,
                    data.imgProd3,
                    data.imgProd4
                ];

                const imgElements = document.querySelectorAll('.slides img');
                slideshowImages.forEach((imgData, index) => {
                    imgElements[index].src = `${imgData}`;
                });
                
                // Function to convert ArrayBuffer to Base64
                function arrayBufferToBase64(buffer) {
                    let binary = '';
                    const bytes = new Uint8Array(buffer);
                    for (let i = 0; i < bytes.byteLength; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    return btoa(binary);
                }
                 // Function to convert ArrayBuffer to Base64
            function arrayBufferToBase64(buffer) {
              let binary = '';
              const bytes = new Uint8Array(buffer);
              for (let i = 0; i < bytes.byteLength; i++) {
                  binary += String.fromCharCode(bytes[i]);
              }
              return btoa(binary);
          }

          // Start slideshow
          let slideIndex = 1;
          showSlides(slideIndex);

          avancarSlides.addEventListener('click', () => {
            plusSlides(1); // Call the plusSlides function when the button is clicked to advance the slides
        });

        retrocederSlides.addEventListener('click', () => {
          plusSlides(-1); // Call the plusSlides function when the button is clicked to advance the slides
        });


        function plusSlides(n) {
          let nextIndex = slideIndex + n;
          if (nextIndex > slideshowImages.length || !slideshowImages[nextIndex - 1]) {
              nextIndex = 1; // Go back to the first slide if the next image is null or exceeds the number of slides
          } else if (nextIndex < 1) {
              nextIndex = slideshowImages.length; // Go to the last slide if going backwards from the first slide
          }
          slideIndex = nextIndex;
          showSlides(slideIndex);
        }
          function currentSlide(n) {
              showSlides(slideIndex = n);
          }

          function showSlides(n) {
            let i;
            const slides = document.getElementsByClassName("slides");
            if (n > slides.length) {
                slideIndex = 1; // If index exceeds the number of slides, go back to the first slide
            }
            if (n < 1) {
                slideIndex = slides.length; // If index is less than 1, go to the last slide
            }
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            slides[slideIndex-1].style.display = "block";
        }
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

    // Adiciona uma quebra de linha
    const br = document.createElement('br');
    secao.appendChild(br);

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

document.addEventListener('DOMContentLoaded', function () {
  const quantidadesSection = document.getElementById('quantidades');
  const quantidades = [1, 10, 50, 100, 500, 1000];

  quantidades.forEach((quantidade, index) => {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkQuant';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `quantidadeCheckbox${index + 1}`;
    checkbox.value = quantidade;
    checkbox.className = 'quantidade-checkbox';
    checkboxWrapper.appendChild(checkbox);
    // Marcar o checkbox de 1 unidade por padrão
    if (quantidade === 1) {
      checkbox.checked = true;
    }
    // Adicionar evento para desmarcar outros checkboxes ao selecionar um
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        document.querySelectorAll('.quantidade-checkbox').forEach(otherCheckbox => {
          if (otherCheckbox !== this) {
            otherCheckbox.checked = false;
          }
        });
      }
    });

    checkboxWrapper.appendChild(checkbox);
    const label = document.createElement('label');
    label.htmlFor = `quantidadeCheckbox${index + 1}`;
    label.textContent = `${quantidade} un`;

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);
    quantidadesSection.appendChild(checkboxWrapper);
  });
});

// Função para obter a quantidade marcada no checkbox
function getMarkedQuantity() {
  const checkboxes = document.querySelectorAll('.quantidade-checkbox');
  for (const checkbox of checkboxes) {
    if (checkbox.checked) {
      return parseInt(checkbox.value);
    }
  }
  return 0;
}

const adicionarAoCarrinhoBtn = document.getElementById('adicionarAoCarrinhoBtn');
const inputQuantidade = document.getElementById('quantidade');

// Lida com o clique no botão "Adicionar ao Carrinho"
adicionarAoCarrinhoBtn.addEventListener('click', async () => {
  try {
    // Obtenha a quantidade escolhida pelo usuário
    let quantidade = parseInt(inputQuantidade.value);

    // Obtenha a quantidade marcada no checkbox
    const markedQuantity = getMarkedQuantity();

    // Verifique se a quantidade marcada no checkbox é maior
    if (markedQuantity > quantidade) {
      quantidade = markedQuantity;
    }

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
    }
  } catch (error) {
    console.error('Erro ao adicionar o produto ao carrinho:', error);
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
        let quantidade = parseInt(inputQuantidade.value);
    
        // Obtenha a quantidade marcada no checkbox
        const markedQuantity = getMarkedQuantity();
    
        // Verifique se a quantidade marcada no checkbox é maior
        if (markedQuantity > quantidade) {
          quantidade = markedQuantity;
        }
    
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
            window.location.href = '/carrinho'
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
        }
      } catch (error) {
        console.error('Erro ao adicionar o produto ao carrinho:', error);
      }
    });
});