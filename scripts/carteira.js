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