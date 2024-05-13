fetch('/pedidos-cadastrados')
.then(response => response.json())
.then(data => {
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
                <a href="detalhes-pedidos.html?idPedido=${pedidos.idPed}&idProduto=${pedidos.idProduto}" id="verPed">Detalhes do Pedido</a>
            `;
            pedidosList.appendChild(li);
        })
})
.catch(error => console.error('Erro ao buscar pedidos:', error));