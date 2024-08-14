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
                        <svg width="80" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31.8181 22.2222H35.2272V30.0556L40.7726 33.9724L39.0682 37.5834L31.8181 32.4724V22.2222ZM38.9318 12.0278C36.8864 5.02774 31.4318 0 25 0C18.8636 0 13.6363 4.58336 11.3636 11.1112C5.09091 11.1112 0 17.3333 0 25C0 32.6666 5.09091 38.8889 11.3636 38.8889H19.7273C22.2955 45.4446 27.75 50 34.0908 50C42.8863 50 50 41.3057 50 30.5556C50 21.8889 45.3636 14.5556 38.9318 12.0278ZM11.3636 33.3333C7.59091 33.3333 4.54545 29.6112 4.54545 25C4.54545 20.3889 7.59091 16.6666 11.3636 16.6666C12.2045 16.6666 13.0227 16.8611 13.7727 17.1944C14.6591 10.6112 19.3182 5.55555 25 5.55555C28.7045 5.55555 31.9773 7.75003 34.0908 11.1112C25.2727 11.1112 18.1818 19.8333 18.1818 30.5556C18.1818 31.5 18.2499 32.4167 18.3637 33.3333H11.3636ZM34.0908 44.4446C27.8181 44.4446 22.7273 38.2223 22.7273 30.5556C22.7273 22.8889 27.8181 16.6666 34.0908 16.6666C40.3635 16.6666 45.4545 22.8889 45.4545 30.5556C45.4545 38.2223 40.3635 44.4446 34.0908 44.4446Z" fill="#F37160"/>
                        </svg>
                        <br>
                        Enviar Depois
                        </label>
                    </div>
                    <div id="inputUpload">
                        <input type="file" name="enviarArte${produto.produtoId}" id="enviarArte${produto.produtoId}" style="display:none" data-produto-id="${produto.produtoId}">
                        <label for="enviarArte${produto.produtoId}">
                        <svg width="80" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 50C9.04545 50 6.09849 48.3646 3.65909 45.0937C1.2197 41.8021 0 37.7917 0 33.0624C0 29 0.886362 25.3749 2.65909 22.1875C4.44696 19 6.7803 16.9687 9.65908 16.0938C10.6136 11.3022 12.5076 7.42703 15.3409 4.46875C18.1894 1.48958 21.409 0 25 0C29.4393 0 33.1969 2.12501 36.2726 6.375C39.3636 10.6042 40.909 15.7709 40.909 21.875C43.5303 22.2916 45.697 23.8542 47.4091 26.5625C49.1363 29.2291 50 32.3542 50 35.9375C50 39.8542 49.0076 43.1771 47.0226 45.9063C45.0378 48.6354 42.6211 50 39.7727 50H27.2726C26.0303 50 24.9621 49.3854 24.0682 48.1563C23.1743 46.9479 22.7273 45.4792 22.7273 43.7499V27.6562L19.0908 32.4999L15.9091 28.1251L25 15.625L34.0908 28.1251L30.9091 32.4999L27.2726 27.6562V43.7499H39.7727C41.3636 43.7499 42.7045 42.9897 43.7954 41.4687C44.9014 39.9687 45.4545 38.1249 45.4545 35.9375C45.4545 33.7501 44.9014 31.9062 43.7954 30.4062C42.7045 28.8854 41.3636 28.1251 39.7727 28.1251H36.3637V21.875C36.3637 17.5625 35.2575 13.8751 33.0454 10.8125C30.8334 7.77075 28.1515 6.25 25 6.25C21.8636 6.25 19.1819 7.77075 16.9545 10.8125C14.7425 13.8751 13.6363 17.5625 13.6363 21.875H12.5C10.303 21.875 8.43181 22.948 6.88636 25.0938C5.32575 27.2187 4.54545 29.7916 4.54545 32.8126C4.54545 35.8334 5.32575 38.4376 6.88636 40.625C8.43181 42.7083 10.303 43.7499 12.5 43.7499H18.1818V50" fill="#F37160"/>
                        </svg>   
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
                        produtoElement.querySelector('label[for="enviarDepois' + produto.produtoId + '"]').style.color = 'black';
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
                      <svg width="100" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 50C9.04545 50 6.09849 48.3646 3.65909 45.0937C1.2197 41.8021 0 37.7917 0 33.0624C0 29 0.886362 25.3749 2.65909 22.1875C4.44696 19 6.7803 16.9687 9.65908 16.0938C10.6136 11.3022 12.5076 7.42703 15.3409 4.46875C18.1894 1.48958 21.409 0 25 0C29.4393 0 33.1969 2.12501 36.2726 6.375C39.3636 10.6042 40.909 15.7709 40.909 21.875C43.5303 22.2916 45.697 23.8542 47.4091 26.5625C49.1363 29.2291 50 32.3542 50 35.9375C50 39.8542 49.0076 43.1771 47.0226 45.9063C45.0378 48.6354 42.6211 50 39.7727 50H27.2726C26.0303 50 24.9621 49.3854 24.0682 48.1563C23.1743 46.9479 22.7273 45.4792 22.7273 43.7499V27.6562L19.0908 32.4999L15.9091 28.1251L25 15.625L34.0908 28.1251L30.9091 32.4999L27.2726 27.6562V43.7499H39.7727C41.3636 43.7499 42.7045 42.9897 43.7954 41.4687C44.9014 39.9687 45.4545 38.1249 45.4545 35.9375C45.4545 33.7501 44.9014 31.9062 43.7954 30.4062C42.7045 28.8854 41.3636 28.1251 39.7727 28.1251H36.3637V21.875C36.3637 17.5625 35.2575 13.8751 33.0454 10.8125C30.8334 7.77075 28.1515 6.25 25 6.25C21.8636 6.25 19.1819 7.77075 16.9545 10.8125C14.7425 13.8751 13.6363 17.5625 13.6363 21.875H12.5C10.303 21.875 8.43181 22.948 6.88636 25.0938C5.32575 27.2187 4.54545 29.7916 4.54545 32.8126C4.54545 35.8334 5.32575 38.4376 6.88636 40.625C8.43181 42.7083 10.303 43.7499 12.5 43.7499H18.1818V50" fill="#F37160"/>
                      </svg>   
                      <br>
                      ${inputFile.files[0].name}                 
                      </label>`
                  } else {
                      // Se não houver arquivos, exibe o checkbox e o label correspondente
                      checkbox.style.display = "";
                      label.style.display = "";
                      // Restaura o texto do label para "Enviar Arquivo"
                      labelEnvArt.innerHTML = `                        <label for="enviarArte${produto.produtoId}">
                      <svg width="80" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.5 50C9.04545 50 6.09849 48.3646 3.65909 45.0937C1.2197 41.8021 0 37.7917 0 33.0624C0 29 0.886362 25.3749 2.65909 22.1875C4.44696 19 6.7803 16.9687 9.65908 16.0938C10.6136 11.3022 12.5076 7.42703 15.3409 4.46875C18.1894 1.48958 21.409 0 25 0C29.4393 0 33.1969 2.12501 36.2726 6.375C39.3636 10.6042 40.909 15.7709 40.909 21.875C43.5303 22.2916 45.697 23.8542 47.4091 26.5625C49.1363 29.2291 50 32.3542 50 35.9375C50 39.8542 49.0076 43.1771 47.0226 45.9063C45.0378 48.6354 42.6211 50 39.7727 50H27.2726C26.0303 50 24.9621 49.3854 24.0682 48.1563C23.1743 46.9479 22.7273 45.4792 22.7273 43.7499V27.6562L19.0908 32.4999L15.9091 28.1251L25 15.625L34.0908 28.1251L30.9091 32.4999L27.2726 27.6562V43.7499H39.7727C41.3636 43.7499 42.7045 42.9897 43.7954 41.4687C44.9014 39.9687 45.4545 38.1249 45.4545 35.9375C45.4545 33.7501 44.9014 31.9062 43.7954 30.4062C42.7045 28.8854 41.3636 28.1251 39.7727 28.1251H36.3637V21.875C36.3637 17.5625 35.2575 13.8751 33.0454 10.8125C30.8334 7.77075 28.1515 6.25 25 6.25C21.8636 6.25 19.1819 7.77075 16.9545 10.8125C14.7425 13.8751 13.6363 17.5625 13.6363 21.875H12.5C10.303 21.875 8.43181 22.948 6.88636 25.0938C5.32575 27.2187 4.54545 29.7916 4.54545 32.8126C4.54545 35.8334 5.32575 38.4376 6.88636 40.625C8.43181 42.7083 10.303 43.7499 12.5 43.7499H18.1818V50" fill="#F37160"/>
                      </svg>   
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
                      window.location.href = '/pagamento';
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
  async function obterQuantidadeCarrinho() {
    try {
        // Fazer uma requisição para a rota /api/carrinho
        const response = await fetch('/api/carrinho');
        const carrinho = await response.json();
        
        // Calcular a quantidade total de produtos no carrinho
        const quantidadeTotal = carrinho.reduce((total, produto) => total + produto.quantidade, 0);
        
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