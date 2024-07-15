document.addEventListener('DOMContentLoaded', () => {
    fetch('/pedidos-cadastrados')
    .then(response => response.json())
    .then(data => {
        // Inicialize contadores para cada status
        let aguardandoCount = 0;
        let aceitosCount = 0;
        let finalizadosCount = 0;
        let entreguesCount = 0;

        // Percorra os pedidos e conte quantos estão em cada status
        data.pedidos.forEach(pedido => {
            switch (pedido.statusPed) {
                case 'Aguardando':
                    aguardandoCount++;
                    break;
                case 'Pedido Aceito Pela Gráfica':
                    aceitosCount++;
                    break;
                case 'Finalizado':
                    finalizadosCount++;
                    break;
                case 'Pedido Enviado pela Gráfica':
                    finalizadosCount++;
                    break;
                case 'Pedido Entregue pela Gráfica':
                    entreguesCount++;
                    break;
                default:
                    break;
            }
        });
        // Atualize os spans com os contadores
        document.getElementById('totalPedidosFazer').textContent = aguardandoCount;
        document.getElementById('totalPedidosAceitos').textContent = aceitosCount;
        document.getElementById('totalPedidosFinalizados').textContent = finalizadosCount;
        document.getElementById('totalPedidosEntregues').textContent = entreguesCount;
    })
});

const divPedidosAguardando = document.getElementById('pedidosAguardando');
const divPedidosAceitos = document.getElementById('pedidosAceitos');
const divPedidosFinalizados = document.getElementById('pedidosFinalizados');
const divPedidosEntregues = document.getElementById('pedidosEntregues');
const carregamento = document.getElementById('carregamento');
// Função para atualizar a lista de pedidos com base no status selecionado
async function atualizarListaPedidos(status1, status2) {
    try {
        const response = await fetch('/pedidos-cadastrados');
        const data = await response.json();

        // Filtrar os pedidos com base no status
        const pedidosFiltrados = data.pedidos.filter(pedido => pedido.statusPed === status1 || pedido.statusPed === status2);

        // Limpar a lista de pedidos
        const pedidosList = document.getElementById('pedidos-list');
        pedidosList.innerHTML = '';
        carregamento.style.display = 'none';

        // Adicionar os pedidos filtrados à lista
        for (const pedido of pedidosFiltrados) {
            const li = document.createElement('div');
            li.id = `pedido${pedido.idPed}`;
            li.className = 'cxPedido';
            li.style.display = 'block';
            const dataCriacao = new Date(pedido.createdAt);
            const dataFormatada = dataCriacao.toLocaleString('pt-BR');
            const idProduto = pedido.idProduto;
            const imgUrl = await pegarImagemProduto(idProduto);
            li.innerHTML = `
                <img src="${imgUrl}" alt="Imagem do produto">
                <h2 class="ped-nome">${pedido.nomeProd}</h2>
                <p class="ped-id">ID ${pedido.idPed}</p>
                <p class="ped-valor">R$ ${pedido.valorProd}</p>
                <p class="ped-quant">${pedido.quantidade} unidades</p>
                <p id="dataCriacao">${dataFormatada}</p>
                <a href="detalhes-pedidos?idPedido=${pedido.idPed}&idProduto=${pedido.idProduto}" id="verPed">Detalhes do Pedido</a>
            `;
            pedidosList.appendChild(li);
        }
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
    }
}

// Função para obter a URL da imagem do produto
async function pegarImagemProduto(idProduto) {
    try {
        const imgResponse = await fetch(`/imagens/${idProduto}`);
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

// Adicionar eventos de clique para cada divisão de status
document.addEventListener('DOMContentLoaded', () => {
    carregamento.style.display = 'block';
    atualizarListaPedidos('Aguardando');
    divPedidosAguardando.setAttribute('style', 'box-shadow: -1px 3px 5px #F69896;');
    divPedidosAceitos.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosFinalizados.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosEntregues.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
});

document.getElementById('pedidosAguardando').addEventListener('click', () => {
    carregamento.style.display = 'block';
    atualizarListaPedidos('Aguardando');
    divPedidosAguardando.setAttribute('style', 'box-shadow: -1px 3px 5px #F69896;');
    divPedidosAceitos.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosFinalizados.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosEntregues.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
});

document.getElementById('pedidosAceitos').addEventListener('click', () => {
    carregamento.style.display = 'block';
    atualizarListaPedidos('Pedido Aceito Pela Gráfica');
    divPedidosAguardando.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosAceitos.setAttribute('style', 'box-shadow: -1px 3px 5px #F69896;');
    divPedidosFinalizados.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosEntregues.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
});

document.getElementById('pedidosFinalizados').addEventListener('click', () => {
    carregamento.style.display = 'block';
    atualizarListaPedidos('Finalizado', 'Pedido Enviado pela Gráfica');
    divPedidosAguardando.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosAceitos.setAttribute('style', 'box-shadow: -1px 3px 5px black');
    divPedidosFinalizados.setAttribute('style', 'box-shadow: -1px 3px 5px #F69896;');
    divPedidosEntregues.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
});

document.getElementById('pedidosEntregues').addEventListener('click', () => {
    carregamento.style.display = 'block';
    atualizarListaPedidos('Pedido Entregue pela Gráfica');
    divPedidosAguardando.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosAceitos.setAttribute('style', 'box-shadow: -1px 3px 5px black');
    divPedidosFinalizados.setAttribute('style', 'box-shadow: -1px 3px 5px black;');
    divPedidosEntregues.setAttribute('style', 'box-shadow: -1px 3px 5px #F69896;');
});

const nomeGrafica = document.getElementById('nomeGrafica');

async function carregarInfoUsers() {
    try {
        const response = await fetch('/perfilGrafica/dados');
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do usuário');
        }

        const data = await response.json();
        nomeGrafica.innerText = `${data.userCad}`
    } catch (error) {
        console.log("erro")
        window.location.href = '/login-graficas'
    }
}

carregarInfoUsers();