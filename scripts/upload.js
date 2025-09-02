const btnEnvArt = document.getElementById("btnEnvArt");
const carregamento = document.getElementById("carregamento");
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
        } else {
          const todosComArte = produtos.every(produto => !!produto.downloadLink);
          
          if (todosComArte) {
            window.location.href = '/formato-entrega';
            return; // Interrompe a execução
          } 
          // Caso contrário, exiba os produtos do carrinho
          for (const produto of produtos) {
            if (!produto.downloadLink) {
            const produtoElement = document.createElement('div');
                produtoElement.classList.add('produto-carrinho');
                produtoElement.dataset.produtoId = produto.id; // Definindo o atributo data-produto-id
                // Fetch the image URL for the product
                const idDoProduto = produto.produtoId
                const srcDaImagem = await pegarImagemDoProduto(idDoProduto);
                produtoElement.innerHTML = `
                <img src="${srcDaImagem}" alt="Imagem do Produto" id="imgProd">
                <div id="inputsArt">
                    <div id="Depois">
                        <input type="checkbox" name="enviarDepois${produto.produtoId}" id="enviarDepois${produto.produtoId}" style="display:none">
                        <label for="enviarDepois${produto.produtoId}">
                        <img src="https://i.imgur.com/FDykDnU.png" style="width: 50px; height: 50px;"></img>
                        <br>
                        Enviar Depois
                        </label>
                    </div>
                    <div id="inputUpload">
                        <input type="file" name="enviarArte${produto.produtoId}" id="enviarArte${produto.produtoId}" style="display:none" data-produto-id="${produto.produtoId}">
                        <label for="enviarArte${produto.produtoId}">
                        <img src="https://i.imgur.com/3UKUWqw.png" alt=""></img>   
                        <br>
                        Enviar Arquivo                   
                        </label>
                    </div>
                </div>
                `;
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
                //FORMATANDO O CHECKBOX DE ENVIAR DEPOIS
                const checkbox = produtoElement.querySelector(`#enviarDepois${produto.produtoId}`);
                const svg = produtoElement.querySelector('svg');

                checkbox.addEventListener('change', function() {
                    if (checkbox.checked) {
                        checkbox.parentNode.style.transition = "0.8s"
                        checkbox.parentNode.style.backgroundColor = '#F37160';  // Define o background-color do label
                        svg.querySelector('path').setAttribute('fill', 'white'); // Define o fill do SVG como branco
                        // Define a cor do texto do label como branco
                        produtoElement.querySelector('label[for="enviarDepois' + produto.produtoId + '"]').style.color = 'white';
                        produtoElement.querySelector('label[for="enviarDepois' + produto.produtoId + '"]').style.fontWeight = '700';
                      
                    } else {
                        checkbox.parentNode.style.transition = "0.8s"
                        checkbox.parentNode.style.backgroundColor = ''; // Reverter para o estilo padrão
                        svg.querySelector('path').setAttribute('fill', '#F37160'); // Reverte o fill do SVG para a cor original
                        // Reverte a cor do texto do label para a cor original
                        produtoElement.querySelector('label[for="enviarDepois' + produto.produtoId + '"]').style.color = 'white';
                        produtoElement.querySelector('label[for="enviarDepois' + produto.produtoId + '"]').style.fontWeight = '400';
                      
                    }
                });

                //FORMATANDO O INPUT FILE
                const label = produtoElement.querySelector(`label[for="enviarDepois${produto.produtoId}"]`);
                const inputFile = produtoElement.querySelector(`#enviarArte${produto.produtoId}`);
                const labelEnvArt = produtoElement.querySelector(`label[for="enviarArte${produto.produtoId}"]`);

                inputFile.addEventListener('change', () => {
                  // Verifica se há arquivos selecionados
                  if (inputFile.files.length > 0) {
                      // Se houver arquivos, oculta o checkbox e o label correspondente
                      checkbox.style.display = "none";
                      label.style.display = "none";
                      checkbox.checked = false;
                      // Define o texto do label como o nome do arquivo selecionado
                      labelEnvArt.innerHTML = `                        <label for="enviarArte${produto.produtoId}">
                      <img src="https://i.imgur.com/3UKUWqw.png" alt=""></img>     
                      <br>
                      ${inputFile.files[0].name}                 
                      </label>`
                  } else {
                      // Se não houver arquivos, exibe o checkbox e o label correspondente
                      checkbox.style.display = "";
                      label.style.display = "";
                      // Restaura o texto do label para "Enviar Arquivo"
                      labelEnvArt.innerHTML = `                        <label for="enviarArte${produto.produtoId}">
                      <img src="https://i.imgur.com/3UKUWqw.png" alt=""></img>     
                      <br>
                      Enviar Arquivo                   
                      </label>`;
                      labelEnvArt.setAttribute("style","font-weight:700; color:;");
                  }
              });
              
              btnEnvArt.addEventListener('click', async function() {
                carregamento.style.display = 'block';
                const files = document.querySelectorAll('input[type="file"]');
                const formData = new FormData();
            
                files.forEach(fileInput => {
                   const produtoId = 15456;
                  if (fileInput.files.length > 0) {
                    const produtoId = fileInput.dataset.produtoId;
                    formData.append('files', fileInput.files[0], produtoId);
                  }else {
                    // Criar um arquivo com nome "Enviar Arte Depois" para produtos sem arte
                    const blob = new Blob(['Enviar Arte Depois'], { type: 'text/plain' });
                    const file = new File([blob], 'Enviar Arte Depois');
                    formData.append('files', file, produtoId);
                  }
                });
            
                try {
                  carregamento.style.display = 'block';
                  btnEnvArt.disabled = true;
            
                  const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });
            
                  btnEnvArt.disabled = false;
            
                  if (response.ok) {
                    const responseBody = await response.text();
                    console.log(`Arquivos enviados com sucesso.`);
                    
                    if (responseBody === 'Upload concluído com sucesso') {
                      carregamento.style.display = 'none';
                      window.location.href = '/formato-entrega';
                    }
                  } else {
                    console.error('Erro ao enviar arquivo para o servidor:', response.statusText);
                    alert('Erro ao enviar os arquivos. Tente novamente.');
                  }
                } catch (error) {
                  console.error('Erro ao processar o envio de arquivo:', error);
                  
                } finally {
                  carregamento.style.display = 'none';
                  btnEnvArt.disabled = false;
                }
              });
                    
                carrinhoProdutos.appendChild(produtoElement);
                }
              }
        }
      } catch (error) {
        console.error('Erro ao carregar produtos do carrinho:', error);
      }
    }
  
    // Chame a função para carregar os produtos do carrinho quando a página for carregada
    carregarProdutosCarrinho();
  });