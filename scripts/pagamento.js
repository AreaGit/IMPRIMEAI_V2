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
const divBoletoContainer = document.getElementById('boletoContainer');
const formCartao = document.getElementById('formCartao');
const btnCartaoCredito = document.getElementById('btnCartaoCredito');
const avisoNaoAutorizado = document.getElementById('avisoNaoAutorizado');
const avisoEstorno = document.getElementById('avisoEstorno');
const avisoCancelado = document.getElementById('avisoCancelado');
const avisoAguardeCancelamento = document.getElementById('avisoAguardeCancelamento');
const avisoTransacaoErro = document.getElementById('avisoTransacaoErro');
const avisoFalhaTransacao = document.getElementById('avisoFalhaTransacao');
const criacaoBoleto = document.getElementById('criacaoBoleto');
const carregamento = document.getElementById('carregamento');
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

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
            totalFretes += produto.endereco.frete || 0; // Adicionar o valor do frete do produto ao total
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
    carregamento.style.display = 'block'
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
        pagamentoBoleto();
    } else if (divAtiva === "cartaoCredito") {
        carregamento.style.display = 'none'
        formCartao.style.display = 'block'
    } else if (divAtiva === "carteiraUser") {
        pagamentoCarteira();
    } else {
        erroFormaPagamento.style.display = 'block';
        window.setTimeout(() => {
          erroFormaPagamento.style.display = 'none';
          window.location.reload()
        }, 5000);
    }
});

async function criarPedido(metodoPag) {
  try {
        const totalAPagar = valorAtualGlobal;  
        const metodPag = metodoPag;

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
            carregamento.style.display = 'none'
            pedidoCriado.style.display = 'block';
            setTimeout(() => {
              pedidoCriado.style.display = 'none';
              window.location.href = 'perfil';
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

async function criarPedidoBoleto(metodoPag, chargeId) {
  try {
        const totalAPagar = valorAtualGlobal;  
        const metodPag = metodoPag;

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
            criacaoBoleto.style.display = 'block'
            setTimeout(() => {
              criacaoBoleto.style.display = 'none'
              window.location.href = 'perfil';
            }, 15000);
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
          idTransacao: chargeId,
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
  carregamento.style.display = 'none'
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
    const metodoPag = "Pix"
    // Se o status for "paid", pare de verificar e execute a próxima etapa
    if (status === 'paid') {
      qrCodeContainer.style.display = 'none'
      console.log('A transação foi paga com sucesso!');
      criarPedido(metodoPag); // Chame a função criarPedido quando a transação for paga
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

async function pagamentoBoleto() {
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
    const complementoCliente = perfilData.compCad
    
    // Crie um objeto para armazenar os dados do perfil do usuário
    const perfilUsuario = {
        emailCliente: emailCliente,
        cpfCliente: cpfCliente,
        cepCliente: cepCliente,
        cidadeCliente: cidadeCliente,
        estadoCliente: estadoCliente,
        ruaCliente: ruaCliente,
        complementoCliente: complementoCliente,
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
    const response2 = await fetch('/processarPagamento-boleto', {
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
    const chargeId = responseData[0].id;
    const qrCodeBoleto = responseData[0].last_transaction.qr_code;
    const pdfBoleto = responseData[0].last_transaction.pdf;
    carregamento.style.display = 'none'
    divBoletoContainer.style.display = 'block';
    divBoletoContainer.innerHTML = `
      <img src="${qrCodeBoleto}">
      <a href="${pdfBoleto}" target="_blank">Acesse o pdf</a>
      <p>O boleto expira em 1 dia</p>
    `
    verificarStatusTransacaoBoleto(chargeId);
  }catch (error) {
    console.log(error)
  }
  }

  async function verificarStatusTransacaoBoleto(chargeId) {
    try {
        // Faça uma solicitação fetch para a rota que criamos no servidor para obter informações sobre a cobrança
        const response = await fetch(`/charges/${chargeId}`);
        if (!response.ok) {
            throw new Error('Erro ao obter informações da cobrança');
        }
        
        // Extrair o status da resposta
        const { status } = await response.json();
        const metodoPag = "Boleto";

        // Se o status for "paid", pare de verificar e execute a próxima etapa
        if (status === 'pending') {
          setTimeout(() => {
            divBoletoContainer.style.display = 'none';
              criarPedidoBoleto(metodoPag, chargeId); // Chame a função criarPedido quando a transação for paga
          }, 15000); // Aguarde 15 segundos antes de chamar a função
          return;
        }
        
        // Se o status não for "paid", aguarde um curto período e, em seguida, verifique novamente
        // Verifique a cada 5 segundos (5000 milissegundos)
        setTimeout(() => {
            verificarStatusTransacaoBoleto(chargeId);
        }, 5000);
    } catch (error) {
        console.error('Erro:', error);
    }
}

  const expiryDateField = document.getElementById('expiry_date_field');
  expiryDateField.addEventListener('input', function(event) {
    const input = event.target;
    const trimmedValue = input.value.replace(/[^0-9]/g, '').slice(0, 4);
    const formattedValue = trimmedValue.replace(/(\d{2})(\d{2})/, '$1/$2');
    input.value = formattedValue;
  });
  const cardNumberField = document.getElementById('card_number_field');
  
  cardNumberField.addEventListener('input', function(event) {
    const input = event.target;
    const trimmedValue = input.value.replace(/[^0-9]/g, '').slice(0, 16);
    const formattedValue = trimmedValue.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    input.value = formattedValue;
  });
  
btnCartaoCredito.addEventListener('click', async() => {
    const nomeTitular = document.getElementById('name_field').value;
    const numCarElement = document.getElementById('card_number_field');
    let numCar = numCarElement.value.replace(/\s/g, ''); // Remove all spaces
    const cvvCard = document.getElementById('cvv_field').value;
    // Get the expiration date input field value
    const expiryDate = document.getElementById('expiry_date_field').value;
    // Split the expiration date into month and year
    const [month, year] = expiryDate.split('/').map(str => parseInt(str));    
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
      const complementoCliente = perfilData.compCad
      
      // Crie um objeto para armazenar os dados do perfil do usuário
      const perfilUsuario = {
          emailCliente: emailCliente,
          cpfCliente: cpfCliente,
          cepCliente: cepCliente,
          cidadeCliente: cidadeCliente,
          estadoCliente: estadoCliente,
          ruaCliente: ruaCliente,
          complementoCliente: complementoCliente,
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

      const formData = {
        numCar: numCar,
        nomeTitular: nomeTitular,
        mesExp: month,
        anoExp: year,
        cvvCard: cvvCard
      };
      // Envie os dados do formulário e do perfil do usuário para o backend
      const response2 = await fetch('/processarPagamento-cartao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formData: formData, perfilData: perfilUsuario })
      });
    
      if (!response2.ok) {
          throw new Error('Erro ao processar pagamento');
      }
    
      // Extrair o idTransacao da resposta
      const responseData = await response2.json();
      const dadosTransacao = responseData
      monitorarTransacaoCartao(dadosTransacao);
    }catch (error) {
      console.log(error)
    }
});

async function monitorarTransacaoCartao(dadosTransacao) {
  const chargeId = dadosTransacao[0].id
  try {
    // Faça uma solicitação fetch para a rota que criamos no servidor para obter informações sobre a cobrança
    const response = await fetch(`/charges/${chargeId}`);
    if (!response.ok) {
      throw new Error('Erro ao obter informações da cobrança');
    }
    
    // Extrair o status da resposta
    const { status } = await response.json();
    const metodoPag = "Cartão de Crédito"
    if (status === 'waiting_capture') {
      setTimeout(() => {
        monitorarTransacaoCartao(dadosTransacao);
      }, 5000);
    } else if(status === 'paid') {
      formCartao.style.display = 'none';
      criarPedido(metodoPag);
    }else if(status === "not_authorized") {
        avisoNaoAutorizado.style.display = 'none';
        setTimeout(() => {
          window.location.reload();
        }, 5000);
    }else if (status === "refunded") {
      avisoEstorno.style.display = 'none';
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }else if(status === "voided") {
      avisoCancelado.style.display = 'none';
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }else if(status === "waiting_cancellation") {
      avisoAguardeCancelamento.style.display = 'none';
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }else if(status === "with_error") {
      avisoTransacaoErro.style.display = 'none';
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }else if(status === "failed") {
      avisoFalhaTransacao.style.display = 'block';
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

async function pagamentoCarteira() {
  const totalAPagar = valorAtualGlobal;
  const metodPag = 'Carteira Usuário';
  const userId = getCookie('userId');
  // Verifique o saldo da carteira do usuário
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/saldoUsuario', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status === 200) {
      const saldo = JSON.parse(xhr.responseText).saldo;

      // Verifique se o saldo é suficiente para a compra
      if (saldo >= totalAPagar) {
        const descontoData = {
          valorPed: totalAPagar,
          metodPag: metodPag
        };
        const metodoPag = "Carteira Usuário"
        // Faça uma solicitação para descontar o valor da compra do saldo da carteira
        const descontoRequest = new XMLHttpRequest();
        descontoRequest.open('POST', '/descontarSaldo', true);
        descontoRequest.setRequestHeader('Content-Type', 'application/json');
        descontoRequest.onload = function () {
          if (descontoRequest.status === 200) {
            // O desconto foi aplicado com sucesso, crie o pedido
            const pedidoData = {
              totalItens,
              valorPed: totalAPagar,
              metodPag
            };
            criarPedido(metodoPag);
          } else {
            console.error('Erro ao descontar o saldo:', descontoRequest.statusText);
            alert('Erro ao descontar o saldo');
          }
        };
        descontoRequest.onerror = function () {
          console.error('Erro de rede ao descontar o saldo');
          alert('Erro de rede ao descontar o saldo');
        };
        descontoRequest.send(JSON.stringify(descontoData));
      } else {
        // Saldo insuficiente, redirecione o usuário para recarregar a carteira
        alert('Saldo insuficiente. Por favor, recarregue sua carteira.');
        window.location.href = '/carteira';
      }
    } else {
      console.error('Erro ao verificar o saldo da carteira:', xhr.statusText);
      alert('Erro ao verificar o saldo da carteira');
    }
  };
  xhr.onerror = function () {
    console.error('Erro de rede ao verificar o saldo da carteira');
    alert('Erro de rede ao verificar o saldo da carteira');
  };
  xhr.send();
}
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