document.addEventListener("DOMContentLoaded", () => {
    fetch("/saldo-allusers")
    .then(response => response.json())
    .then(data => {
        const lojasContainer = document.getElementById("lojas-list");
        data.forEach(loja => {
            const lojaCard = document.createElement("div");
            lojaCard.classList.add("loja-card");
            lojaCard.innerHTML = `
                <h3>${loja.name}</h3>
                <p><strong>Comprou:</strong> ${loja.comprou}</p>
                <p><strong>Número de Pedidos:</strong> ${loja.numPedidos}</p>
                <p><strong>Saldo:</strong> R$ ${loja.balance}</p>
                
                <button onclick="abrirDetalhe(${loja.id}, '${loja.name}', '${loja.balance}', '${loja.email}')">Detalhe da Loja</button>
                <button onclick="baixarRelatorio(${loja.id})">Baixar Relatório da Loja</button>
            `;
            lojasContainer.appendChild(lojaCard);
        });
    });
});

function baixarRelatorio(id) {
    window.location.href = `/relatorio-loja/${id}`;
}

function baixarRelatorioTodasLojas() {
    window.location.href = '/relatorio-todas-lojas';
}

function abrirDetalhe(id, name, saldo, email) {
    document.getElementById("detalhe-id").textContent = id;
    document.getElementById("detalhe-nome").textContent = name;
    document.getElementById("detalhe-saldo").textContent = saldo;
    document.getElementById("detalhe-email").textContent = email;

    fetch(`/pedidos-usuario-empresa/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data.pedidos);
            const listaPedidos = document.getElementById("detalhe-pedidos");
            listaPedidos.innerHTML = "";

            if (!data.pedidos || data.pedidos.length === 0) {
                listaPedidos.innerHTML = "<li>Nenhum pedido encontrado.</li>";
                return;
            }

            // Filtra pedidos para garantir que pertencem ao ID da loja
            const pedidosFiltrados = data.pedidos.filter(pedido => pedido.idUserPed == id);

            if (pedidosFiltrados.length === 0) {
                listaPedidos.innerHTML = "<li>Nenhum pedido encontrado para esta loja.</li>";
                return;
            }

            pedidosFiltrados.forEach(pedido => {
                const item = document.createElement("li");
                item.innerHTML = `<a href="detalhesPedidosUser?idPedido=${pedido.id}">Pedido #${pedido.id} - Status: ${pedido.statusPed}</a>`;
                listaPedidos.appendChild(item);
            });
        })
        .catch(error => console.error("Erro ao buscar pedidos:", error));

    document.getElementById("modal").style.display = "block";
}

function fecharModal() {
    document.getElementById("modal").style.display = "none";
}