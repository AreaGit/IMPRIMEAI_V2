const pedidoId = new URLSearchParams(window.location.search).get('id');

// Seletores dos elementos do HTML
const idEl = document.querySelector(".dados-principais .pedido-id");
const lojaEl = document.querySelector(".dados-principais .pedido-loja");
const clienteEl = document.querySelector(".dados-principais .pedido-cliente");
const enderecoEl = document.querySelector(".dados-principais .pedido-endereco");
const cidadeEl = document.querySelector(".dados-principais .pedido-cidade");
const ufEl = document.querySelector(".dados-principais .pedido-uf");
const bairroEl = document.querySelector(".dados-principais .pedido-bairro");
const obsEl = document.querySelector(".dados-principais .pedido-obs");
const produtosTabela = document.querySelector(".produtos tbody");

if (pedidoId) {
  fetch(`/pedido-detalhes?id=${pedidoId}`)
    .then(response => response.json())
    .then(data => {
      if (data.pedido) {
        const pedido = data.pedido;
        const enderecoPedido = data.enderecos?.[0] || {};
        console.log(data)
        // Preenche os dados principais
        idEl.textContent = pedido.idPed;
        lojaEl.textContent = data.loja || "Não informado";
        clienteEl.textContent = data.nomeCliente || "Não informado";
        enderecoEl.textContent = enderecoPedido.rua || "Não informado";
        cidadeEl.textContent = enderecoPedido.cidade || "Não informado";
        ufEl.textContent = enderecoPedido.estado || "--";
        bairroEl.textContent = enderecoPedido.bairro || "Não informado";
        obsEl.textContent = pedido.observacoes || "Nenhuma";

        // Renderiza produtos
        produtosTabela.innerHTML = ""; // limpa antes
        data.produtos.forEach((produto, index) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${produto.quantidade}</td>
            <td><strong>Item ${index + 1}:</strong> ${produto.nomeProd}</td>
          `;
          produtosTabela.appendChild(tr);
        });

      } else {
        alert(data.message || "Pedido não encontrado");
      }
    })
    .catch(error => {
      console.error("Erro ao buscar dados:", error);
      alert("Erro ao carregar o protocolo de entrega");
    });
}