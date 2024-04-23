const btnContPag = document.getElementById("btnContPag");
const divPix = document.getElementById("pix");
const divBoleto = document.getElementById("boleto");
const divCartaoCredito = document.getElementById("cartaoCredito");
const divMinhaCarteira = document.getElementById("carteiraUser");
let mostrarDivPix = false;
let mostrarDivBoleto = false;
let mostrarDivCartao = false;
let mostrarCarteira = false;
const totalComp = document.getElementById('totalComp');
const totalFrete = document.getElementById('totalItens');
const totalDesconto = document.getElementById('totalDesconto');
const totalAPagarElement = document.getElementById('totalComp');
let valorAtual
const erroFormaPagamento = document.getElementById('avisoUser');
const textFrete = document.getElementById('totalItens');

// Função para fazer o fetch do endereço
async function fetchEndereco() {
  try {
    const response = await fetch('/api/endereco');
    const endereco = await response.json();
    if (endereco.frete == undefined) {
      fetch('/api/carrinho')
        .then(response => response.json())
        .then(data => {
          let totalFretes = 0;
          // Iterar sobre os produtos do carrinho
          data.forEach(produto => {
            totalFretes += produto.frete || 0; // Adicionar o valor do frete do produto ao total
          });

          // Exibir o total dos fretes no console
          textFrete.innerText = `R$ ${totalFretes.toFixed(2)}`;
          // Atualizar o total a pagar após obter os valores dos fretes
          atualizarTotalAPagar(totalFretes);
        })
        .catch(error => console.error('Erro ao obter os dados do carrinho:', error));
    } else {
      textFrete.innerText = `R$ ${endereco.frete}`;
      // Atualizar o total a pagar com o valor do frete
      atualizarTotalAPagar(parseFloat(endereco.frete));
    }
  } catch (error) {
    console.log('erro');
  }
}

fetchEndereco();

function atualizarTotalAPagar() {
  const totalAPagarElement = document.getElementById('totalComp');
  const totalAPagarElement3 = document.getElementById('subTotal');
  const valorDescontoElement = document.getElementById('totalDesconto');
  const totalFrete = document.getElementById('totalItens');
  // Faça uma solicitação AJAX para obter os produtos do carrinho
  fetch('/api/carrinho')
    .then(response => response.json())
    .then(produtos => {
      // Verifique se algum produto possui desconto aplicado
      const descontoAplicado = produtos.some(produto => produto.descontado === true);
      // Calcule a soma dos valores dos produtos no carrinho
      const totalAPagar = produtos.reduce((total, produto) => total + (produto.quantidade * produto.valorUnitario), 0);
      const subtotal = produtos.reduce((total, produto) => total + (produto.quantidade * produto.valorUnitario), 0);
      // Se algum produto tiver desconto aplicado, exiba o novo total considerando o desconto
      if (descontoAplicado) {
        const novoTotalAPagar = totalAPagar * 0.95; // Aplicar desconto de 5%
        const desconto = totalAPagar - novoTotalAPagar; // Calcular o valor do desconto
        totalAPagarElement.innerText = `R$ ${novoTotalAPagar.toFixed(2)}`;
        totalAPagarElement3.textContent = "R$ " + totalAPagar.toFixed(2);
        valorDescontoElement.textContent = "R$ " + desconto.toFixed(2); // Exibir o valor do desconto em reais
      } else {
        // Caso contrário, exiba o total sem desconto
        totalAPagarElement.textContent = "R$ " + totalAPagar.toFixed(2);
        totalAPagarElement3.textContent = "R$ " + totalAPagar.toFixed(2);
        valorDescontoElement.textContent = "R$ 0.00";
      }

      // Obtenha o valor do frete
      const frete = parseFloat(totalFrete.textContent.replace('R$ ', '')); // Remove o "R$ " e converte para float
      if (!isNaN(frete)) {
        // Se o valor do frete for válido, adicione-o ao subtotal
        const totalAPagar = subtotal + frete;
        totalAPagarElement.textContent = "R$ " + totalAPagar.toFixed(2);
      } else {
        // Caso contrário, exiba apenas o subtotal
        totalAPagarElement.textContent = "R$ " + subtotal.toFixed(2);
      }
      valorAtual = totalAPagarElement.textContent
    
    })
    .catch(error => {
      console.error('Erro ao calcular o total a pagar:', error);
    });
}
// Chame a função para calcular e atualizar o total a pagar quando necessário
// Por exemplo, após adicionar ou remover um produto do carrinho
atualizarTotalAPagar();
// Função para desativar todas as divs, exceto a div ativa
function desativarOutrasDivs(divAtiva) {
    const divs = [divPix, divBoleto, divCartaoCredito, divMinhaCarteira];
    divs.forEach(div => {
        if (div !== divAtiva) {
            div.classList.remove('div-ativa'); // Removemos a classe div-ativa das outras divs
            div.setAttribute("style", "transition: 0.8s; box-shadow: none; border: 1px solid #86868B;");
        }
    });
}

// Função para alternar o estilo da div e sua ativação
function toggleDivStyle(element, mostrar) {
    if (mostrar) {
        element.classList.add('div-ativa'); // Adicionamos a classe div-ativa para marcar a div como ativa
        element.setAttribute("style", "transition: 0.8s; box-shadow: 3px 2px 20px #F37160; border: 1px solid white;");
    } else {
        element.classList.remove('div-ativa'); // Removemos a classe div-ativa para marcar a div como inativa
        element.setAttribute("style", "transition: 0.8s; box-shadow: none; border: 1px solid #86868B;");
    }
}

// Adiciona o event listener para cada div
divPix.addEventListener('click', () => {
    toggleDivStyle(divPix, !mostrarDivPix);
    if (!mostrarDivPix) {
        desativarOutrasDivs(divPix);
    }
    mostrarDivPix = !mostrarDivPix;
});

divBoleto.addEventListener('click', () => {
    toggleDivStyle(divBoleto, !mostrarDivBoleto);
    if (!mostrarDivBoleto) {
        desativarOutrasDivs(divBoleto);
    }
    mostrarDivBoleto = !mostrarDivBoleto;
});

divCartaoCredito.addEventListener('click', () => {
    toggleDivStyle(divCartaoCredito, !mostrarDivCartao);
    if (!mostrarDivCartao) {
        desativarOutrasDivs(divCartaoCredito);
    }
    mostrarDivCartao = !mostrarDivCartao;
});

divMinhaCarteira.addEventListener('click', () => {
    toggleDivStyle(divMinhaCarteira, !mostrarCarteira);
    if (!mostrarCarteira) {
        desativarOutrasDivs(divMinhaCarteira);
    }
    mostrarCarteira = !mostrarCarteira;
});


btnContPag.addEventListener('click', () => {
    const divs = [divPix, divBoleto, divCartaoCredito, divMinhaCarteira];
    let divAtiva = null;
    divs.forEach(div => {
        if (div.classList.contains('div-ativa')) {
            divAtiva = div.id;
        }
    });
    if (divAtiva === "pix") {
        pagamentoPix();
    } else if (divAtiva === "boleto") {
        alert("A div ativa é boleto");
    } else if (divAtiva === "cartaoCredito") {
        alert("A div ativa é cartão de crédito");
    } else if (divAtiva === "carteiraUser") {
        alert("A div ativa é carteira do usuário");
    } else {
        erroFormaPagamento.style.display = 'block';
        window.setTimeout(() => {
          erroFormaPagamento.style.display = 'none';
          window.location.reload()
        }, 5000);
    }
});


async function pagamentoPix () {
    try {
        const totalAPagar = valorAtual;
        const valor = 0.1;
        const descricao = 'pedido'
        console.log(valor)
    
        const response = await fetch('/gerarQRPix', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ valor, descricao })
              });
    
    if (!response.ok) {
                throw new Error('Erro ao gerar QR Code PIX');
              }
              
            const { qrDataURL, pixPayload, idPix, expirationDatePix } = await response.json();
              console.log('PIX ID:', idPix)
            // Exibir o QR Code na página
              qrCodeContainer.style.display = 'block'
              const qrCodeImg = document.createElement('img');
              qrCodeImg.src = qrDataURL;
              qrCodeImg.id = 'imgPix'
              document.getElementById('qrCodeContainer').innerHTML = '';
              document.getElementById('qrCodeContainer').appendChild(qrCodeImg);
              const copiarPayloadBtn = document.createElement('button');
              copiarPayloadBtn.id = 'copiarPayloadBtn';
              copiarPayloadBtn.innerText = 'PIX Copia e Cola';
              copiarPayloadBtn.addEventListener('click', async() => {
                // Copiar o payload PIX para a área de transferência
                await navigator.clipboard.writeText(pixPayload);
                alert('Código PIX copiado com sucesso!');
    
              })
              qrCodeContainer.appendChild(copiarPayloadBtn);
              
              const h2Container = document.createElement('h2');
              h2Container.innerText = 'Pagamento Pix';
              h2Container.id = 'h2Container';
              qrCodeContainer.appendChild(h2Container);
    
              // Exibir a data de expiração do PIX formatada
              const expirationDateFormatted = new Date(expirationDatePix).toLocaleString('pt-BR', { timeZone: 'UTC' });
              const expirationDateParagraph = document.createElement('p');
              expirationDateParagraph.id = 'expirationDateParagraph';
              expirationDateParagraph.innerText = `O PIX irá expirar em ${expirationDateFormatted}`;
              qrCodeContainer.appendChild(expirationDateParagraph);
    
            monitorarStatusPix(idPix);
          } catch (error) {
            console.error('Erro ao gerar o código PIX:', error);
            alert('Erro ao gerar o código PIX. Por favor, tente novamente mais tarde.');
          }
};

async function verificarStatusPix(idPix) {
    try {
      // Inicialize o cliente Pagarme com sua chave de API
      const client = await pagarme.client.connect({ api_key: 'ak_live_Gelm3adxJjY9G3cOGcZ8bPrL1596k2' });
  
      // Consulte a transação PIX usando o ID do PIX
      const transaction = await client.transactions.find({ id: idPix });
  
      // Verifique o status da transação
      const status = transaction.status;
      
      // Retorna o status da transação PIX
      return status;
    } catch (error) {
      console.error('Erro ao verificar o status do PIX pelo Pagarme:', error);
  
      if (error.response && error.response.errors) {
        console.error('Detalhes do erro:', error.response.errors);
      }
  
      throw new Error('Erro ao verificar o status do PIX pelo Pagarme');
    }
  }
  // Função para verificar continuamente o status do PIX
  async function monitorarStatusPix(idPix) {
    try {
      // Definir um intervalo de polling (em milissegundos)
      const pollingInterval = 5000; // 5 segundos
  
      while (true) {
        // Verificar o status do PIX
        const status = await verificarStatusPix(idPix);
        console.log('Status do PIX:', status);
  
        if (status === 'paid') {
          qrCodeContainer.style.display = 'none'
          // Se o PIX estiver pago, sair do loop de polling
          console.log('O PIX foi pago!, CRIANDO O PEDIDO');
          const totalItens = document.getElementById('totalItensCarrinho').textContent;
          const totalAPagar = 0.1;
          const metodPag = 'Pix';
  
          // Crie um objeto XMLHttpRequest
          const xhr = new XMLHttpRequest();
  
          // Configure a solicitação POST
          xhr.open('POST', '/criar-pedidos', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
  
          // Defina o manipulador de eventos para a resposta da solicitação
          xhr.onload = function () {
            if (xhr.status === 200) {
              // A solicitação foi bem-sucedida, você pode processar a resposta aqui
              const response = JSON.parse(xhr.responseText);
              alert(response.message);
  
              // Exiba a mensagem de confirmação
              document.getElementById('confirmacaoCompra').style.display = 'block';
            } else {
              // A solicitação não foi bem-sucedida, trate o erro aqui
              console.error('Erro ao finalizar a compra:', xhr.statusText);
              alert('Erro ao finalizar a compra');
            }
          };
  
          // Trate erros de rede
          xhr.onerror = function () {
            console.error('Erro de rede ao finalizar a compra');
            alert('Erro de rede ao finalizar a compra');
          };
  
          // Crie um objeto com os dados do pedido, incluindo o valor total do carrinho
          const pedidoData = {
            totalItens,
            valorPed: totalAPagar, // Atualize valorPed com o valor total do carrinho
            metodPag,
            idTransacao: idPix,
          };
          console.log('PEDIDO CRIADO')
          // Envie os dados como JSON
          const requestData = JSON.stringify(pedidoData);
          xhr.send(requestData);
          break;
        }
  
        // Aguardar o intervalo de polling antes de fazer a próxima verificação
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
      }
    } catch (error) {
      console.error('Erro ao monitorar o status do PIX:', error);
    }
  }