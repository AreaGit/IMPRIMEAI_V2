const nomeUser = document.getElementById('nomeUser');
const qrCodeContainer = document.getElementById('qrCodeContainer');

async function carregarInfoUsers() {
    try {
        const response = await fetch('/perfil/dados');
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }

        const data = await response.json();
        nomeUser.innerText = `${data.userCad}`
    } catch (error) {
        console.log("erro")
        window.location.href = '/cadastro'
    }
}

carregarInfoUsers();


const btnFecharValores = document.getElementById('fechar-valores');
const divValoresRecarga = document.getElementById('valoresRecarga');
const btnAbrirValores = document.getElementById('abrirValores');

btnAbrirValores.addEventListener('click', () => {
    divValoresRecarga.style.display = 'block'
});

btnFecharValores.addEventListener('click', () => {
    divValoresRecarga.style.display = 'none'
});

const valores = document.querySelectorAll('#valoresRecarga ul li');
let valorSelecionado = 0;

valores.forEach(valor => {
    valor.addEventListener('click', () => {
        // Remover a classe 'selecionado' de todos os valores
        valores.forEach(item => {
            item.classList.remove('selecionado');
        });
        
        // Adicionar a classe 'selecionado' apenas ao valor clicado
        valor.classList.add('selecionado');
        
        // Armazenar o valor selecionado na variável
        valorSelecionado = parseFloat(valor.textContent.replace('R$ ', ''));
    });
});

const abrirMetodos = document.getElementById('abrirMetodos');
const metodosRecarga = document.getElementById('metodosRecarga');
const fecharRecarga = document.getElementById('fechar-recarga');

abrirMetodos.addEventListener('click', () => {
    divValoresRecarga.style.display = 'none'
    metodosRecarga.style.display = 'block'
});

fecharRecarga.addEventListener('click', () => {
    metodosRecarga.style.display = 'none'
});

// Solicitação AJAX para buscar e exibir o saldo do usuário na página HTML
async function exibirSaldoUsuario() {
    try {
        const response = await fetch('/saldoUsuario');
        const data = await response.json();
        const saldoFormatado = formatarSaldo(data.saldo); // Formate o saldo se necessário

        // Atualize o elemento HTML com o saldo do usuário
        document.getElementById('saldoUser').textContent = saldoFormatado;
    } catch (error) {
        console.error('Erro ao buscar saldo do usuário:', error);
    }
}

// Função para formatar o saldo (adicione R$ e formate para duas casas decimais)
function formatarSaldo(saldo) {
    return `${saldo.toFixed(2)}`;
}
 
// Chame a função para exibir o saldo do usuário quando a página for carregada
exibirSaldoUsuario();

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
 };
 let userId = getCookie('userId');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`/transacoesUsuario/${userId}`);
        const data = await response.json();

        const transacoes = data.transacoes;
        const tabelaTransacoes = document.getElementById('tabelaTransacoes');
        const tbody = tabelaTransacoes.querySelector('tbody');

        // Limpa o conteúdo atual da tabela
        tbody.innerHTML = '';

        // Loop sobre as transações e cria uma linha na tabela para cada uma
        transacoes.forEach(transacao => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transacao.id}</td>
                <td>R$ ${transacao.valor}</td>
                <td>${transacao.tipo}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Erro ao buscar e exibir transações do usuário:', error);
    }
});

const pix = document.getElementById('pix');

pix.addEventListener('click', async() => {
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
        totalCompra:  valorSelecionado,
    };
  
    // Envie os dados do formulário e do perfil do usuário para o backend
    const response2 = await fetch('/processarPagamento-pix-carteira', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ perfilData: perfilUsuario })
    });
  
    if (!response2.ok) {
        throw new Error('Erro ao processar pagamento');
    }
    metodosRecarga.style.display = 'none';
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
});

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
        const detalhesPagamento = {
            userId: userId,
            valor: valorSelecionado,
            idTransacao: chargeId,
            metodoPagamento: "PIX",
            status: "PAGO"
        };
        registrarPagamento(detalhesPagamento)
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
//Função para registrar o pagamento na carteira do usuário
async function registrarPagamento(detalhesPagamento) {
    try {
    const response = await fetch('/registrarPagamento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(detalhesPagamento)
    });
        
    if (!response.ok) {
        throw new Error('Erro ao registrar o pagamento');
    }
        
        console.log('Pagamento registrado com sucesso!');
        window.location.reload();
    } catch (error) {
        console.error('Erro ao registrar o pagamento:', error);
    }
}