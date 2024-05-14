// Função para atualizar a lista de pedidos com base no status selecionado
function atualizarListaPedidos(status) {
    fetch('/pedidos-cadastrados')
        .then(response => response.json())
        .then(data => {
            // Filtrar os pedidos com base no status
            const pedidosFiltrados = data.pedidos.filter(pedido => pedido.statusPed === status);

            // Limpar a lista de pedidos
            const pedidosList = document.getElementById('pedidos-list');
            pedidosList.innerHTML = '';

            // Adicionar os pedidos filtrados à lista
            pedidosFiltrados.forEach(pedido => {
                const li = document.createElement('div');
                li.id = `pedido${pedido.idPed}`
                li.className = `cxPedido`
                li.style.display = 'block';
                const dataCriacao = new Date(pedido.createdAt);
                const dataFormatada = dataCriacao.toLocaleString('pt-BR');
                const imgUrl = `/imagens/${pedido.idProduto}`;
                li.style.display = 'block';
                li.innerHTML = `
                    <img src="${imgUrl}"></img>
                    <h2 class="ped-nome">${pedido.nomeProd}</h2>
                    <p class="ped-id">ID ${pedido.idPed}</p>
                    <p class="ped-valor">R$ ${pedido.valorProd}</p>
                    <p class="ped-quant">${pedido.quantidade} unidades</p>
                    <p id="dataCriacao">${dataFormatada}</p>
                    <a href="detalhes-pedidos?idPedido=${pedido.idPed}&idProduto=${pedido.idProduto}" id="verPed">Detalhes do Pedido</a>
                `;
                pedidosList.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao buscar pedidos:', error));
}

// Adicionar eventos de clique para cada divisão de status
document.addEventListener('DOMContentLoaded', () => {
    atualizarListaPedidos('Aguardando');
});

document.getElementById('pedidosAguardando').addEventListener('click', () => {
    atualizarListaPedidos('Aguardando');
});

document.getElementById('pedidosAceitos').addEventListener('click', () => {
    atualizarListaPedidos('Pedido Aceito Pela Gráfica');
});

document.getElementById('pedidosFinalizados').addEventListener('click', () => {
    atualizarListaPedidos('Finalizado');
});

document.getElementById('pedidosEntregues').addEventListener('click', () => {
    atualizarListaPedidos('Pedido Entregue pela Gráfica');
});

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
})