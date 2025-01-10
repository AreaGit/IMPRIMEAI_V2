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
    document.querySelector('#enderecosDiv').style.display = 'none';
    document.querySelector('#pedidosDiv').style.display = 'none';
    document.querySelector('#carteiraDiv').style.display = 'none';

});
async function carregarInfoUsers() {
    try {
        const response = await fetch('/perfil/dados-empresa');
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }

        const data = await response.json();
        
        const cpfInput = document.getElementById('cpf');
        cpfInput.value = data.cpfCad;
        const nomeInput = document.getElementById('nomeCompleto');
        nomeInput.value = data.userCad;
        const emailInput = document.getElementById('email');
        emailInput.value = data.emailCad;
        const telefoneInput = document.getElementById('telefone');
        telefoneInput.value = data.telefoneCad;
    } catch (error) {
        console.log("erro")
        window.location.href = '/cpq/inicio'
    }
}
carregarInfoUsers();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCadastroEndereco');
    const listaEnderecos = document.getElementById('listaEnderecos');
    const cepInput = document.getElementById('cep');
    const ruaInput = document.getElementById('rua');
    const bairroInput = document.getElementById('bairro');
    const estadoInput = document.getElementById('estado');
    const cidadeInput = document.getElementById('cidade');

    // Máscara para o campo CEP
    cepInput.addEventListener('input', (e) => {
        let cep = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cep.length > 5) {
            cep = cep.slice(0, 5) + '-' + cep.slice(5, 8); // Adiciona o traço
        }
        e.target.value = cep;
    });

    // Função para buscar endereço pelo CEP
    const buscarEnderecoPeloCep = async (cep) => {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
            if (!response.ok) throw new Error('Erro ao buscar CEP');

            const data = await response.json();
            if (data.erro) throw new Error('CEP não encontrado');

            // Preencher os campos do formulário
            ruaInput.value = data.logradouro;
            bairroInput.value = data.bairro;
            estadoInput.value = data.uf;
            cidadeInput.value = data.localidade;
        } catch (error) {
            console.error('Erro ao buscar endereço pelo CEP:', error);
            alert('CEP inválido ou não encontrado.');
        }
    };

    // Evento para detectar alterações no input de CEP
    cepInput.addEventListener('blur', () => {
        const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cep.length === 8) { // O CEP precisa ter 8 dígitos
            buscarEnderecoPeloCep(cep);
        } else {
            alert('Digite um CEP válido com 8 dígitos.');
        }
    });

    // Função para carregar os endereços salvos
    const carregarEnderecos = async () => {
        try {
            const response = await fetch(`/enderecos-empresa/${userId}`);
            const enderecos = await response.json();

            listaEnderecos.innerHTML = ''; // Limpa a lista de endereços
            enderecos.forEach((endereco) => {
                const li = document.createElement('li');
                li.textContent = `${endereco.rua}, ${endereco.numero}, ${endereco.complemento} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}, CEP: ${endereco.cep}`;
                listaEnderecos.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
        }
    };

    // Função para cadastrar um novo endereço
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const enderecoData = Object.fromEntries(formData);

        enderecoData.id_usuario = userId; // Substitua com o ID do usuário autenticado

        try {
            const response = await fetch('/cadastro-enderecos-empresa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enderecoData),
            });

            if (response.ok) {
                alert('Endereço salvo com sucesso!');
                form.reset();
                carregarEnderecos(); // Atualiza a lista de endereços
            } else {
                alert('Erro ao salvar endereço.');
            }
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
        }
    });

    // Carrega os endereços ao abrir a página
    carregarEnderecos();
});

const listaDePedidos = document.getElementById('listaDePedidos');
// Fazer uma solicitação Fetch para obter os pedidos do usuário
fetch(`/pedidos-usuario-empresa/${userId}`)
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
            
            // Adiciona as informações do pedido
            divPedido.innerHTML += `
                <h2>${pedido.itenspedidos[0].nomeProd}</h2>
                <div class="pedido-info">
                    <p>ID ${pedido.id}</p>
                    <p>R$ ${pedido.valorPed.toFixed(2)}</p>
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
        const imgResponse = await fetch(`/imagens-empresa/${idDoProduto}`);
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
const formCartao = document.getElementById('formCartao');
const btnCartaoCredito = document.getElementById('btnCartaoCredito');
const valores = document.querySelectorAll('#valoresRecarga ul li');

// Variável para armazenar o valor selecionado
let valorSelecionado = 0;

// Carregar informações do usuário


// Exibir saldo do usuário
async function exibirSaldoUsuario() {
    try {
        const response = await fetch('/saldoUsuario-empresas');
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

// Seleção de valor para recarga
valores.forEach(valor => {
    valor.addEventListener('click', () => {
        valores.forEach(item => item.classList.remove('selected'));
        valor.classList.add('selected');
        valorSelecionado = parseFloat(valor.getAttribute('data-valor'));
        abrirMetodosBtn.disabled = false;
    });
});

// Abrir métodos de pagamento
abrirMetodosBtn.addEventListener('click', () => {
    divValoresRecarga.style.display = 'none';
    metodosRecarga.style.display = 'block';
});

// Fechar métodos de pagamento
fecharRecargaBtn.addEventListener('click', () => {
    metodosRecarga.style.display = 'none';
});

// Função para registrar o pagamento
async function registrarPagamento(detalhesPagamento) {
    try {
        const response = await fetch('/registrarPagamento-empresas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(detalhesPagamento),
        });
        if (!response.ok) throw new Error('Erro ao registrar o pagamento');
        console.log('Pagamento registrado com sucesso!');
        window.location.reload();
    } catch (error) {
        console.error('Erro ao registrar o pagamento:', error);
    }
}

// Gerenciar recarga por Pix
document.getElementById('pix').addEventListener('click', async () => {
    try {
        const response = await fetch('/processarPagamento-pix-carteira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: valorSelecionado }),
        });
        if (!response.ok) throw new Error('Erro ao processar pagamento via Pix');
        const { qr_code_url, charge_id } = await response.json();
        qrCodeContainer.innerHTML = `<img src="${qr_code_url}"><button id="copiarCodigo">Copiar QR Code</button>`;
        qrCodeContainer.style.display = 'block';

        document.getElementById('copiarCodigo').addEventListener('click', async () => {
            await navigator.clipboard.writeText(qr_code_url);
            alert('Código copiado!');
        });

        verificarStatusTransacao(charge_id);
    } catch (error) {
        console.error('Erro no Pix:', error);
    }
});

// Gerenciar recarga por Boleto
document.getElementById('boleto').addEventListener('click', async () => {
    try {
        const response = await fetch('/processarPagamento-boleto-carteira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: valorSelecionado }),
        });
        if (!response.ok) throw new Error('Erro ao processar pagamento via Boleto');
        const { boleto_url, charge_id } = await response.json();
        boletoContainer.innerHTML = `<a href="${boleto_url}" target="_blank">Abrir Boleto</a>`;
        boletoContainer.style.display = 'block';
        verificarStatusTransacao(charge_id);
    } catch (error) {
        console.error('Erro no Boleto:', error);
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

        const response = await fetch('/processarPagamento-cartao-carteira', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor: valorSelecionado, nomeTitular, numeroCartao, mesExp, anoExp, cvv }),
        });
        if (!response.ok) throw new Error('Erro ao processar pagamento via Cartão de Crédito');
        const { charge_id } = await response.json();
        verificarStatusTransacao(charge_id);
    } catch (error) {
        console.error('Erro no Cartão de Crédito:', error);
    }
});

// Verificar status da transação
async function verificarStatusTransacao(charge_id) {
    try {
        const response = await fetch(`/charges/${charge_id}`);
        if (!response.ok) throw new Error('Erro ao verificar status da transação');
        const { status } = await response.json();

        if (status === 'paid') {
            alert('Pagamento realizado com sucesso!');
            registrarPagamento({ valor: valorSelecionado, status });
        } else if (status === 'pending') {
            setTimeout(() => verificarStatusTransacao(charge_id), 5000);
        } else {
            alert(`Pagamento com status: ${status}`);
        }
    } catch (error) {
        console.error('Erro ao verificar transação:', error);
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarInfoUsers();
    exibirSaldoUsuario();
});
document.getElementById('logo').addEventListener('click', () => {
    window.location.href = '/cpq/inicio'
});