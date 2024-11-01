const avisoAdicionadoaoCarrinho = document.getElementById('avisoGeral');
const erroCarrinho = document.getElementById('erroCarrinho');
const avancarSlides = document.getElementById('avancarSlides');
const retrocederSlides = document.getElementById('retrocederSlides');
const downloadGab = document.getElementById('downloadGab');
let modeloSelecionado
let marcaSelecionada
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
                  const productId = produtoId; // Assumindo que o ID do produto está em data.id
                  fetch(`/produto/${productId}/gabarito`)
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Erro ao baixar o gabarito');
                      }
                      return response.blob();
                    })
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${data.nomeProd}_gabarito.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                    })
                    .catch(error => console.error('Erro ao baixar gabarito:', error));
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
        console.log(variacoes)
        // Verifica se existem variações antes de continuar
        if (variacoes && variacoes.length > 0) {
            // Chame a função para criar os selects
            if(!variacoes.modelo) {
              criarSelect(variacoes, 'modelo', 'Modelo');
              modeloSelecionado = document.getElementById('modelo');
            }
            if(!variacoes.marca) {
              criarSelect(variacoes, 'marca', 'Marca');
              marcaSelecionada = document.getElementById('marca')
            }
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
  
  // Itera sobre as variações para criar os options
  variacoes.forEach(variacao => {
      try {
          // Remove barras invertidas duplicadas e formata a string removendo colchetes e aspas
          const valorFormatado = variacao[tipo].replace(/\\+/g, '').replace(/[\[\]"']/g, '');

          // Se o valor formatado for "Não há", interrompe a execução
          if (valorFormatado.includes("Não há")) {
              return;
          }

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

          // Adiciona o select à seção
          secao.appendChild(select);
      } catch (error) {
          console.error('Erro ao processar variação:', error);
      }
  });
}

// Chame a função
carregarVariacoesDoProduto();

document.addEventListener('DOMContentLoaded', function () {
  const quantidadesSection = document.getElementById('quantidades');
  const params = new URLSearchParams(window.location.search);
  const produtoId = params.get('id'); // Substitua pelo ID real do produto

  // Fetch para obter as quantidades da API
  fetch(`/api/quantidades/${produtoId}`)
    .then(response => response.json())
    .then(data => {
      const quantidades = data.quantidades;

      quantidades.forEach((quantidade, index) => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkQuant';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `quantidadeCheckbox${index + 1}`;
        checkbox.value = quantidade;
        checkbox.className = 'quantidade-checkbox';

        // Marcar o checkbox da primeira quantidade por padrão
        if (index === 0) {
          checkbox.checked = true;
        }

        checkbox.addEventListener('change', function () {
          if (this.checked) {
            document.querySelectorAll('.quantidade-checkbox').forEach(otherCheckbox => {
              if (otherCheckbox !== this) {
                otherCheckbox.checked = false;
              }
            });
          }
        });

        const label = document.createElement('label');
        label.htmlFor = `quantidadeCheckbox${index + 1}`;
        label.textContent = `${quantidade} un`;

        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);
        quantidadesSection.appendChild(checkboxWrapper);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar as quantidades:', error);
    });
});

// Função para obter a quantidade marcada no checkbox
function getMarkedQuantity() {
  const checkboxes = document.querySelectorAll('.quantidade-checkbox');
  for (const checkbox of checkboxes) {
    if (checkbox.checked) {
      return parseInt(checkbox.value * inputQuantidade.value);
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
    let quantidade = getMarkedQuantity();

    // Obtenha a quantidade marcada no checkbox
    const markedQuantity = getMarkedQuantity();

    // Verifique se a quantidade é válida (maior que 0)
    if (quantidade <= 0) {
      alert('Por favor, escolha uma quantidade válida maior que 0.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('id');
    const materialSelecionado = document.getElementById('material');
    const formatoSelecionado = document.getElementById('formato');
    const corSelecionada = document.getElementById('cor');
    const enobrecimentoSelecionado = document.getElementById('enobrecimento');
    const acabamentoSelecionado = document.getElementById('acabamento');
    
    const variacoesSelecionadas = {
      idProduto: produtoId,
      marca: marcaSelecionada ? marcaSelecionada.value : null,
      material: materialSelecionado ? materialSelecionado.value : null,
      formato: formatoSelecionado ? formatoSelecionado.value : null,
      cor: corSelecionada ? corSelecionada.value : null,
      enobrecimento: enobrecimentoSelecionado ? enobrecimentoSelecionado.value : null,
      acabamento: acabamentoSelecionado ? acabamentoSelecionado.value : null,
      modelo: modeloSelecionado ? modeloSelecionado.value : null,
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
        window.location.reload();
      }, 3000);
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
        let quantidade = getMarkedQuantity();
    
        // Obtenha a quantidade marcada no checkbox
        const markedQuantity = getMarkedQuantity();
    
    
        // Verifique se a quantidade é válida (maior que 0)
        if (quantidade <= 0) {
          alert('Por favor, escolha uma quantidade válida maior que 0.');
          return;
        }
    
        const params = new URLSearchParams(window.location.search);
        const produtoId = params.get('id');
        const materialSelecionado = document.getElementById('material');
        const formatoSelecionado = document.getElementById('formato');
        const corSelecionada = document.getElementById('cor');
        const enobrecimentoSelecionado = document.getElementById('enobrecimento');
        const acabamentoSelecionado = document.getElementById('acabamento');
        
        const variacoesSelecionadas = {
          idProduto: produtoId,
          marca: marcaSelecionada ? marcaSelecionada.value : null,
          material: materialSelecionado ? materialSelecionado.value : null,
          formato: formatoSelecionado ? formatoSelecionado.value : null,
          cor: corSelecionada ? corSelecionada.value : null,
          enobrecimento: enobrecimentoSelecionado ? enobrecimentoSelecionado.value : null,
          acabamento: acabamentoSelecionado ? acabamentoSelecionado.value : null,
          modelo: modeloSelecionado ? modeloSelecionado.value : null,
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
          }, 2000);
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

fetch(`/api/quantidades/${1}`)
  .then(response => response.json())
  .then(data => {
    console.log(data.quantidades); // Exibe as quantidades no console
  })
  .catch(error => {
    console.error('Erro ao buscar as quantidades:', error);
  });
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
document.addEventListener('DOMContentLoaded', () => {
  const toggleMenu = document.getElementById('toggleMenu');
  const categs = document.getElementById('categs');
  const parentCategs = document.querySelectorAll('.parentCateg');

  // Exibir ou ocultar o menu de categorias principais
  toggleMenu.addEventListener('click', (e) => {
      e.preventDefault();
      categs.style.display = categs.style.display === 'block' ? 'none' : 'block';
  });

  // Função para fechar todas as subcategorias
  const closeAllSubcategories = () => {
      const subCategs = document.querySelectorAll('.subCategAll');
      subCategs.forEach(sub => sub.style.display = 'none');
  };

  // Função para ajustar colunas dinamicamente se a altura ultrapassar 445px
  const adjustColumns = (subCateg) => {
      const subCategHeight = subCateg.scrollHeight; // Altura real da lista
      const maxHeight = 445;

      // Se a altura ultrapassar o limite, ajustar para colunas
      if (subCategHeight > maxHeight) {
          subCateg.style.height = '470px'
          subCateg.style.columnCount = 2;
          subCateg.style.columnGap = '20px';
          subCateg.style.width = '70%'
          subCateg.style.left = '85%'
          subCateg.style.transform = 'translate(-85%)'
          subCateg.style.textAlign = 'justify'
      }
  };

  // Adicionar evento de clique nas categorias para abrir/fechar
  parentCategs.forEach(parent => {
      parent.addEventListener('click', (e) => {
          e.preventDefault();
          const subCateg = parent.nextElementSibling;

          // Fecha todas as subcategorias antes de abrir a nova
          closeAllSubcategories();

          // Abre ou fecha a subcategoria clicada
          if (subCateg) {
              subCateg.style.display = subCateg.style.display === 'block' ? 'none' : 'block';

              // Ajusta colunas dinamicamente baseado na altura
              if (subCateg.style.display === 'block') {
                  adjustColumns(subCateg);
              }
          }
      });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const menuContainer = document.getElementById('menuContainer');
  const toggleMainMenu = document.getElementById('toggleMainMenu');
  const categoryList = document.getElementById('category-list');
  const parentCategories = document.querySelectorAll('.parent-category');

  // Exibir ou ocultar o menu ao clicar no ícone hambúrguer
  menuToggle.addEventListener('click', () => {
      menuContainer.style.display = menuContainer.style.display === 'block' ? 'none' : 'block';
  });

  // Exibir ou ocultar o menu de categorias principais
  toggleMainMenu.addEventListener('click', (e) => {
      e.preventDefault();
      categoryList.style.display = categoryList.style.display === 'block' ? 'none' : 'block';
  });

  // Função para fechar todas as subcategorias
  const closeAllSubcategories = () => {
      const subCategories = document.querySelectorAll('.subcategory-list');
      subCategories.forEach(sub => sub.style.display = 'none');
  };

  // Função para ajustar colunas dinamicamente se a altura ultrapassar 445px
  const adjustColumns = (subCategory) => {
      const subCategoryHeight = subCategory.scrollHeight; // Altura real da lista
      const maxHeight = 445;
      const columnWidth = 300; // Largura de cada coluna

      // Se a altura ultrapassar o limite, ajustar para colunas
      if (subCategoryHeight > maxHeight) {
          const numColumns = Math.ceil(subCategoryHeight / maxHeight);
          subCategory.style.columnCount = numColumns;
          subCategory.style.columnGap = '20px';
          subCategory.style.width = `${numColumns * columnWidth}px`;
      } else {
          // Reseta para uma coluna se a altura estiver dentro do limite
          subCategory.style.columnCount = 1;
          subCategory.style.width = 'auto';
      }
  };

  // Adicionar evento de clique nas categorias para abrir/fechar
  parentCategories.forEach(parent => {
      parent.addEventListener('click', (e) => {
          e.preventDefault();
          const subCategory = parent.nextElementSibling;

          // Fecha todas as subcategorias antes de abrir a nova
          closeAllSubcategories();

          // Abre ou fecha a subcategoria clicada
          if (subCategory) {
              subCategory.style.display = subCategory.style.display === 'block' ? 'none' : 'block';

              // Ajusta colunas dinamicamente baseado na altura
              if (subCategory.style.display === 'block') {
                  adjustColumns(subCategory);
              }
          }
      });
  });
});