let tipoEntrega;
let pId
document.addEventListener('DOMContentLoaded', () => {

// Obtém o ID do pedido e do produto da URL
const urlParams = new URLSearchParams(window.location.search);
const idPedido = urlParams.get('idPedido');
const idProduto = urlParams.get('idProduto');

// Verifica se o ID do pedido e do produto estão presentes na URL
if (idPedido && idProduto) {
// Faz a requisição para o servidor para obter os detalhes do pedido
fetch(`/detalhes-pedido/${idPedido}/${idProduto}`)
.then(response => response.json())
.then(data => {
    console.log(data)
})
}
})