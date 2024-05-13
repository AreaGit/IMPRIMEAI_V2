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
    console.log(data);
    const pedidosList = document.getElementById('pedidos-list');
        data.pedidos.forEach(pedidos => {
            const li = document.createElement('div');
            li.id = `pedido${pedidos.idPed}`
            li.className = `cxPedido`
            li.style.display = 'block';
            const dataCriacao = new Date(pedidos.createdAt);
            const dataFormatada = dataCriacao.toLocaleString('pt-BR');
            const imgUrl = `/imagens/${pedidos.idProduto}`;
            li.style.display = 'block';
            li.innerHTML = `
                <img src="${imgUrl}"></img>
                <h2 class="ped-nome">${pedidos.nomeProd}</h2>
                <p class="ped-id">ID ${pedidos.idPed}</p>
                <p class="ped-valor">R$ ${pedidos.valorProd}</p>
                <p class="ped-quant">${pedidos.quantidade} unidades</p>
                <p id="dataCriacao">${dataFormatada}</p>
                <a href="detalhes-pedidos?idPedido=${pedidos.idPed}&idProduto=${pedidos.idProduto}" id="verPed">Detalhes do Pedido</a>
            `;
            pedidosList.appendChild(li);
        })
})
.catch(error => console.error('Erro ao buscar pedidos:', error));