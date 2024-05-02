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
let valorAtualGlobal = 0;
const erroFormaPagamento = document.getElementById('avisoUser');
const textFrete = document.getElementById('totalItens');
const pedidoCriado = document.getElementById('pedidoCriado');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const divCodigoPix = document.getElementById('codigoPix');

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
      const descontoAplicado = produtos.some(produto => produto.descontado === true);
      const subtotal = produtos.reduce((total, produto) => total + (produto.quantidade * produto.valorUnitario), 0);
      let totalAPagar = subtotal;

      if (descontoAplicado) {
        const novoTotalAPagar = subtotal * 0.95; // Aplicar desconto de 5%
        const desconto = subtotal - novoTotalAPagar;
        totalAPagarElement.innerText = `R$ ${novoTotalAPagar.toFixed(2)}`;
        valorDescontoElement.textContent = "R$ " + desconto.toFixed(2);
      } else {
        totalAPagarElement.textContent = "R$ " + subtotal.toFixed(2);
        valorDescontoElement.textContent = "R$ 0.00";
      }

      totalAPagarElement3.textContent = "R$ " + subtotal.toFixed(2);

      const frete = parseFloat(totalFrete.textContent.replace('R$ ', ''));
      if (!isNaN(frete)) {
        totalAPagar += frete;
      }

      totalAPagarElement.textContent = "R$ " + totalAPagar.toFixed(2);
      valorAtualGlobal = totalAPagar; // Atualizando a variável global

      // Agora você pode usar o valor atualizado aqui dentro
       // Isso mostrará o valor correto após a atualização
    })
    .catch(error => {
      console.error('Erro ao calcular o total a pagar:', error);
    });
}

// Chame a função para calcular e atualizar o total a pagar quando necessário
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
        //criarPedido();
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

async function criarPedido() {
  try {
        const totalAPagar = valorAtualGlobal;  
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
            pedidoCriado.style.display = 'block';
            setTimeout(() => {
              pedidoCriado.style.display = 'none';
              window.location.reload();
            }, 10000);
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
          valorPed: totalAPagar, // Atualize valorPed com o valor total do carrinho
          metodPag,
          //idTransacao: idPix,
        };
        console.log('PEDIDO CRIADO')
        // Envie os dados como JSON
        const requestData = JSON.stringify(pedidoData);
        xhr.send(requestData);
  } catch (error) {
    console.error('Erro ao monitorar o status do PIX:', error);
  }
};

async function pagamentoPix() {
// Fetch para obter os dados do perfil do usuário
try {
  const response = await fetch('/perfil/dados');
  if (!response.ok) {
      throw new Error('Erro ao obter dados do perfil');
  }
  const perfilData = await response.json();

  function formatarTelefone(numero) {
    // Remove todos os caracteres não numéricos
    const numeroLimpo = numero.replace(/\D/g, '');

    // Extrai o DDD (dois primeiros dígitos) e o número do telefone
    const ddd = numeroLimpo.substring(0, 2);
    const numeroTelefone = numeroLimpo.substring(2);

    // Retorna um objeto com as partes do número formatado
    return {
        ddd: ddd,
        numeroTelefone: numeroTelefone
    };
}

  const telefoneFormatado = formatarTelefone(perfilData.telefoneCad);

  // Agora você pode acessar as partes formatadas do número de telefone
  const codPaisCliente = "55";
  const dddCliente = telefoneFormatado.ddd;
  const numeroTelefoneCliente = telefoneFormatado.numeroTelefone;

// Remove non-digit characters from CPF and format it
const cpf = perfilData.cpfCad.replace(/\D/g, ''); // Remove non-digit characters

const cpfCliente = cpf;


  const emailCliente = perfilData.emailCad;
  const cepCliente = perfilData.cepCad;
  const cidadeCliente = perfilData.cidadeCad;
  const ruaCliente = perfilData.endereçoCad;
  const numeroResidenciaCliente = perfilData.numCad;
  const bairroCliente = perfilData.bairroCad;
  const numeroDocumento = perfilData.cpfCad;
  const nomeCliente = perfilData.userCad;
  const paisCliente = "BR";
  const idCliente = perfilData.userId;
  const estadoCliente = perfilData.estadoCad;
  
  // Crie um objeto para armazenar os dados do perfil do usuário
  const perfilUsuario = {
      emailCliente: emailCliente,
      cpfCliente: cpfCliente,
      cepCliente: cepCliente,
      cidadeCliente: cidadeCliente,
      estadoCliente: estadoCliente,
      ruaCliente: ruaCliente,
      numeroResidenciaCliente: numeroResidenciaCliente,
      bairroCliente: bairroCliente,
      numeroDocumento: numeroDocumento,
      nomeCliente: nomeCliente,
      paisCliente: paisCliente,
      codPaisCliente: codPaisCliente,
      dddCliente: dddCliente,
      numeroTelefoneCliente: numeroTelefoneCliente,
      userId: idCliente,
      totalCompra:  valorAtualGlobal,
  };

  // Envie os dados do formulário e do perfil do usuário para o backend
  const response2 = await fetch('/processarPagamento-pix', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ perfilData: perfilUsuario })
  });

  if (!response2.ok) {
      throw new Error('Erro ao processar pagamento');
  }

  // Extrair o idTransacao da resposta
  const responseData = await response2.json();
  const chargeId = responseData[0].id
  const qrPix = responseData[0].last_transaction.qr_code_url;
  const expiracao = responseData[0].last_transaction.expires_at;
  const expiracaoDate = new Date(expiracao);
  const formattedExpiracao = expiracaoDate.toLocaleString('pt-BR', { timeZone: 'UTC' });
  qrCodeContainer.style.display = 'block'
  qrCodeContainer.innerHTML = `
    <img src="${qrPix}">
    <button id="copiarCodigo">Copiar código</button>
    <p>Expira em ${formattedExpiracao}</p>
  `;
  const copiarCodigoPix = document.getElementById('copiarCodigo');
  copiarCodigoPix.addEventListener('click', async() => {
    await navigator.clipboard.writeText(responseData[0].last_transaction.qr_code);
    divCodigoPix.style.display = 'block';
    window.setTimeout(() => {
      divCodigoPix.style.display = 'none';
    }, 5000);
  });

  verificarStatusTransacao(chargeId);
}catch (error) {
  console.log(error)
}
}

async function verificarStatusTransacao(chargeId) {
  try {
    // Faça uma solicitação fetch para a rota que criamos no servidor para obter informações sobre a cobrança
    const response = await fetch(`/charges/${chargeId}`);
    if (!response.ok) {
      throw new Error('Erro ao obter informações da cobrança');
    }
    
    // Extrair o status da resposta
    const { status } = await response.json();
    
    // Se o status for "paid", pare de verificar e execute a próxima etapa
    if (status === 'paid') {
      qrCodeContainer.style.display = 'none'
      console.log('A transação foi paga com sucesso!');
      criarPedido(); // Chame a função criarPedido quando a transação for paga
      return;
    }
    
    // Se o status não for "paid", aguarde um curto período e, em seguida, verifique novamente
    setTimeout(() => {
      verificarStatusTransacao(chargeId);
    }, 5000); // Verifique a cada 5 segundos (5000 milissegundos)
  } catch (error) {
    console.error('Erro:', error);
  }
}