function mostrarAvisoErro() {
  document.getElementById("aviso-erro").style.display = "block";
}

function fecharAvisoErro() {
  document.getElementById("aviso-erro").style.display = "none";
}

function mostrarAvisoSucesso() {
  document.getElementById("aviso-sucesso").style.display = "block";
}

function fecharAvisoSucesso() {
  document.getElementById("aviso-sucesso").style.display = "none";
}

function mostrarAvisoBoleto() {
  document.getElementById("aviso-boleto").style.display = "block";
}

function fecharAvisoBoleto() {
  document.getElementById("aviso-boleto").style.display = "none";
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
  
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
  
    return null; // Retorna null caso o cookie não seja encontrado
}
  
// Pega o cookie
let userId = getCookie("userId");

document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-lateral li');
    const contentSections = document.querySelectorAll('.menu-content');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove classe 'active' de todos os itens
            menuItems.forEach(menu => menu.classList.remove('active'));
            item.classList.add('active');

            // Ocultar todas as seções
            contentSections.forEach(section => section.style.display = 'none');

            // Exibir a seção correspondente
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

    // Exibir a seção inicial (Meus Dados)
    document.querySelector('#dadosDiv').style.display = 'block';
    document.querySelector('#pedidosDiv').style.display = 'none';
    document.querySelector('#carteiraDiv').style.display = 'none';

});
async function carregarInfoUsers() {
    try {
        const response = await fetch('/perfil/dados');
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }

        const data = await response.json();
        
        const cpfInput = document.getElementById('cpf');
        cpfInput.value = data.user.cpfCad;
        const nomeInput = document.getElementById('nomeCompleto');
        nomeInput.value = data.user.userCad;
        const emailInput = document.getElementById('email');
        emailInput.value = data.user.emailCad;
        const telefoneInput = document.getElementById('telefone');
        telefoneInput.value = data.user.telefoneCad;
    } catch (error) {
        console.log("erro")
        window.location.href = '/'
    }
}
carregarInfoUsers();

const btnSairConta = document.getElementById('btnSairConta');

btnSairConta.addEventListener('click', async() => {
    try {
        const response = await fetch('/logout');
        if(!response.ok) {
            throw new Error('Erro ao sair da conta');
        }
        window.location.href = '/login';
    } catch(err) {
        console.log(err);
        window.location.reload();
    }
});

const listaDePedidos = document.getElementById('listaDePedidos');
// Fazer uma solicitação Fetch para obter os pedidos do usuário
fetch(`/pedidos-usuario/${userId}`)
    .then(response => response.json())
    .then(data => {
        // Ordena os pedidos pelo id, do maior para o menor
        data.pedidos.sort((a, b) => b.id - a.id);

        // Renderiza os pedidos na ordem correta
        data.pedidos.forEach(async pedido => {
            const divPedido = document.createElement('div');
            divPedido.className = 'pedido';

            const idDoProduto = pedido.itenspedidos[0].idProduto;
            
            // Cria a imagem do produto
            const imgProduto = document.createElement('img');
            const srcDaImagem = await pegarImagemDoProduto(idDoProduto);
            if (srcDaImagem) {
                imgProduto.src = srcDaImagem;
            } else {
                imgProduto.alt = 'Imagem não disponível';
            }
            divPedido.appendChild(imgProduto);
            let somaFrete
            let valorPedido
            let valorTotal
            console.log(pedido.enderecos[0].frete)
            if(pedido.enderecos[0].frete == null) {
                valorTotal = pedido.valorPed;
            } else {
                // Somando os valores de frete
                somaFrete = pedido.enderecos.reduce((acc, item) => acc + parseFloat(item.frete), 0);

                // Convertendo o valor do pedido para número
                valorPedido = parseFloat(pedido.valorPed);
                
                // Somando o valor do pedido com o total de frete
                valorTotal = somaFrete + valorPedido;
            }

            
            // Adiciona as informações do pedido
            divPedido.innerHTML += `
                <h2>${pedido.itenspedidos[0].nomeProd}</h2>
                <div class="pedido-info">
                    <p>ID ${pedido.id}</p>
                    <p>R$ ${valorTotal.toFixed(2)}</p>
                    <p>${pedido.quantPed} unidade${pedido.quantPed > 1 ? 's' : ''}</p>
                </div>
                <a href="detalhesPedidosUser?idPedido=${pedido.id}">Detalhes do pedido</a>
            `;
            listaDePedidos.appendChild(divPedido);
        });
    })
    .catch(error => console.error('Erro ao buscar pedidos:', error));

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
// Seletores principais
const nomeUser = document.getElementById('nomeUser');
const saldoUser = document.getElementById('saldoUser');
const btnAbrirValores = document.getElementById('abrirValores');
const btnFecharValores = document.getElementById('fechar-valores');
const divValoresRecarga = document.getElementById('valoresRecarga');
const abrirMetodosBtn = document.getElementById('abrirMetodos');
const metodosRecarga = document.getElementById('metodosRecarga');
const fecharRecargaBtn = document.getElementById('fechar-recarga');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const boletoContainer = document.getElementById('boletoContainer');
const cartaoContainer = document.getElementById('cartaoContainer');
const formCartao = document.getElementById('formCartao');
const btnCartaoCredito = document.getElementById('btnCartaoCredito');
const valores = document.querySelectorAll('#valoresRecarga ul li');

// Variável para armazenar o valor selecionado
let valorSelecionado = 0;

// Carregar informações do usuário


// Exibir saldo do usuário
async function exibirSaldoUsuario() {
    try {
        const response = await fetch('/saldoUsuario');
        const data = await response.json();
        saldoUser.textContent = data.saldo.toFixed(2);
    } catch (error) {
        console.error('Erro ao buscar saldo do usuário:', error);
    }
}

// Eventos para abrir e fechar o menu de valores
btnAbrirValores.addEventListener('click', () => {
    divValoresRecarga.style.display = 'block';
});
btnFecharValores.addEventListener('click', () => {
    divValoresRecarga.style.display = 'none';
});

const inputSaldo = document.getElementById('valor');
inputSaldo.addEventListener('input', () => {
    // Remove tudo que não for número
    let valor = inputSaldo.value.replace(/\D/g, '');

    // Garante que o valor seja tratado como um número inteiro para evitar erros
    valor = parseInt(valor || '0', 10);

    // Adiciona os centavos ao valor
    valor = (valor / 100).toFixed(2);

    // Formata com vírgula para separador decimal
    inputSaldo.value = valor.replace('.', ',');

    // Opcional: Exibe formatado como moeda brasileira
    const saldoFormatado = parseFloat(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    document.getElementById('formatado').textContent = saldoFormatado;
    valorSelecionado = inputSaldo.value;
    abrirMetodosBtn.disabled = false;
});

// Seleção de valor para recarga
valores.forEach(valor => {
    valor.addEventListener('click', () => {
        valores.forEach(item => item.classList.remove('selected'));
        valor.classList.add('selected');
        valorSelecionado = parseFloat(valor.getAttribute('data-valor'));
        abrirMetodosBtn.disabled = false;
    });
});
let perfilCarteira;
// Abrir métodos de pagamento
abrirMetodosBtn.addEventListener('click', () => {
    divValoresRecarga.style.display = 'none';
    metodosRecarga.style.display = 'block';
    function dadosUsuario() {
        return fetch('/perfil/dados')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter dados do perfil');
                }
                return response.json();
            })
            .then(perfilData => {
            
            const perfilUsuario = {
                customer: perfilData.user.customer_asaas_id,
                emailCliente: perfilData.user.emailCad,
                cpfCliente: perfilData.user.cpfCad,
                cepCliente: perfilData.user.cepCad,
                cidadeCliente: perfilData.user.cidadeCad,
                estadoCliente: perfilData.user.estadoCad,
                ruaCliente: perfilData.user.endereçoCad,
                numeroResidenciaCliente: perfilData.user.numCad,
                bairroCliente: perfilData.user.bairroCad,
                nomeCliente: perfilData.user.userCad,
                userId: perfilData.user.id,
                telefone: perfilData.user.telefoneCad,
                totalCompra: valorSelecionado, // Certifique-se de que valorSelecionado está definido
            };
            console.log(valorSelecionado)
            return perfilUsuario;
        })
        .catch(err => {
            console.log(err);
        });
}

// Chama a função e manipula o resultado com .then()
dadosUsuario().then(perfil => {
    perfilCarteira = perfil; // Agora a variável global estará preenchida
});
});

let perfilUsuario

fetch('/perfil/dados')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter dados do perfil');
                }
                return response.json();
            })
            .then(perfilData => {
           
            perfilUsuario = {
                customer: perfilData.user.customer_asaas_id,
                emailCliente: perfilData.user.emailCad,
                cpfCliente: perfilData.user.cpfCad,
                cepCliente: perfilData.user.cepCad,
                cidadeCliente: perfilData.user.cidadeCad,
                estadoCliente: perfilData.user.estadoCad,
                ruaCliente: perfilData.user.endereçoCad,
                numeroResidenciaCliente: perfilData.user.numCad,
                bairroCliente: perfilData.user.bairroCad,
                nomeCliente: perfilData.user.userCad,
                userId: perfilData.user.id,
                telefoneCad: perfilData.user.telefoneCad,
                totalCompra: valorSelecionado, // Certifique-se de que valorSelecionado está definido
            };

            console.log(perfilData)
        
        })

        

// Fechar métodos de pagamento
fecharRecargaBtn.addEventListener('click', () => {
    metodosRecarga.style.display = 'none';
});

// Função para registrar o pagamento
async function registrarPagamento(detalhesPagamento) {
    console.log(detalhesPagamento)
    try {
        const response = await fetch('/registrarPagamento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detalhesPagamento),
        });
        if (!response.ok) throw new Error('Erro ao registrar o pagamento');
        console.log('Pagamento registrado com sucesso!');
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } catch (error) {
        console.error('Erro ao registrar o pagamento:', error);
        mostrarAvisoErro();
    }
}

let detalhesPagamento = {
    userId: userId,
    valor: 0.01,
    metodoPagamento: "PIX",
    status: "PAGO",
    idTransacao: 123
}

// Gerenciar recarga por Pix
document.getElementById('pix').addEventListener('click', async () => {
    try {
        const response = await fetch('/processarPagamento-pix-carteira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: valorSelecionado, perfilData: perfilCarteira }),
        });
        if (!response.ok) throw new Error('Erro ao processar pagamento via Pix');
        const result = await response.json();
        console.log('ESSE É O RESPONSE', result)
        qrCodeContainer.innerHTML = `
            <h2>Clique aqui para efetuar o pagamento</h2>
            <a href="${result.data.urlPix}" target="_blank">Acesse Aqui</a>
        `
        qrCodeContainer.style.display = 'block';
        const urlTransacao = result.data.urlPix;
        verificarStatusTransacao(result.data.payment_id, "PIX", urlTransacao);
    } catch (error) {
        console.error('Erro no Pix:', error);
        mostrarAvisoErro();
    }
});

// Gerenciar recarga por Boleto
document.getElementById('boleto').addEventListener('click', async () => {
    try {
        const response = await fetch('/processarPagamento-boleto-carteira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: valorSelecionado, perfilData: perfilUsuario }),
        });
        if (!response.ok) throw new Error('Erro ao processar pagamento via Boleto');
        const dados = await response.json();
        boletoContainer.innerHTML = `
            <h2>Clique aqui para efetuar o pagamento</h2>
            <a href="${dados.data.pdfBoleto}" target="_blank">Acesse Aqui</a>
        `;
        boletoContainer.style.display = 'block';
        const urlTransacao = dados.data.urlTransacao;
        verificarStatusTransacaoBoleto(dados.data.payment_id, "BOLETO", urlTransacao);
    } catch (error) {
        console.error('Erro no Boleto:', error);
        mostrarAvisoErro();
    }
});

// Gerenciar recarga por Cartão de Crédito
document.getElementById('cartaoCredito').addEventListener('click', () => {
    formCartao.style.display = 'block';
    metodosRecarga.style.display = 'none';
});

btnCartaoCredito.addEventListener('click', async () => {
    try {
        const nomeTitular = document.getElementById('name_field').value;
        const numeroCartao = document.getElementById('card_number_field').value.replace(/\s/g, '');
        const [mesExp, anoExp] = document.getElementById('expiry_date_field').value.split('/');
        const cvv = document.getElementById('cvv_field').value;

        const formData = {
            numCar: numeroCartao,
            nomeTitular: nomeTitular,
            mesExp: mesExp,
            anoExp: anoExp,
            cvvCard: cvv
        };

        const response = await fetch('/processarPagamento-cartao-carteira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: valorSelecionado, perfilData: perfilUsuario, formData, nomeTitular, numeroCartao, mesExp, anoExp, cvv }),
        });
        if (!response.ok) throw new Error('Erro ao processar pagamento via Cartão de Crédito');
        const dados = await response.json();
        cartaoContainer.innerHTML = `
            <h2>Clique para visualizar o comprovante</h2>
            <a href="${dados.data.comprovanteCobranca}" target="_blank">Acesse Aqui</a>
        `
        formCartao.style.display = 'none';
        cartaoContainer.style.display = 'block';
        const urlTransacao = dados.data.urlTransacao;
        verificarStatusTransacao(dados.data.payment_id, "CARTÃO", urlTransacao);
    } catch (error) {
        console.error('Erro no Cartão de Crédito:', error);
        mostrarAvisoErro();
    }
});

// Verificar status da transação
async function verificarStatusTransacao(payment_id, metod, urlTransacao) {
    try {
        const response = await fetch(`/status-cobranca/${payment_id}`);
        if (!response.ok) throw new Error('Erro ao verificar status da transação');
        const { status } = await response.json();

        if (status === 'RECEIVED') {
            mostrarAvisoSucesso();
            registrarPagamento({ 
                userId: userId,
                valor: valorSelecionado,
                metodoPagamento: metod,
                status: "PAGO",
                idTransacao: payment_id,
                urlTransacao: urlTransacao
            });
        }else if(status === 'CONFIRMED') {
            mostrarAvisoSucesso();
            registrarPagamento({ 
                userId: userId,
                valor: valorSelecionado,
                metodoPagamento: metod,
                status: "PAGO",
                idTransacao: payment_id,
                urlTransacao: urlTransacao
            });
        } else if (status === 'PENDING') {
            setTimeout(() => verificarStatusTransacao(payment_id), 5000);
        } else {
            alert(`Pagamento com status: ${status}`);
        }
    } catch (error) {
        console.error('Erro ao verificar transação:', error);
        mostrarAvisoErro();
    }
};

async function verificarStatusTransacaoBoleto(payment_id, metod, urlTransacao) {
    try {
        const response = await fetch(`/status-cobranca/${payment_id}`);
        if (!response.ok) throw new Error('Erro ao verificar status da transação');
        const { status } = await response.json();

        if (status === 'RECEIVED' || status === 'CONFIRMED') {
            mostrarAvisoSucesso();
            registrarPagamento({ 
                userId: userId,
                valor: valorSelecionado,
                metodoPagamento: metod,
                status: "PAGO",
                idTransacao: payment_id,
                urlTransacao: urlTransacao
            });
        } else if (status === 'PENDING') {
            setTimeout(() => {
                mostrarAvisoBoleto();
                registrarPagamento({ 
                    userId: userId,
                    valor: valorSelecionado,
                    metodoPagamento: metod,
                    status: "ESPERANDO PAGAMENTO",
                    idTransacao: payment_id,
                    urlTransacao: urlTransacao
                });
            }, 10000);
        } else {
            alert(`Pagamento com status: ${status}`);
        }
    } catch (error) {
        console.error('Erro ao verificar transação:', error);
        mostrarAvisoErro();
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarInfoUsers();
    exibirSaldoUsuario();
});
document.getElementById('logo').addEventListener('click', () => {
    window.location.href = '/'
});