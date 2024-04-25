const nomeUser = document.getElementById('nomeUser');

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